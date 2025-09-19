const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const _ = require('lodash');

const assessmentConfig = require('../config/assessment-config');
const assessmentData = require('../../data/data');

class PDFGenerationService {
  constructor() {
    this.browser = null;
    this.templatesPath = path.join(__dirname, '../templates');
    this.outputPath = path.join(__dirname, '../generated-pdfs');

    this.ensureOutputDirectory();
    this.registerHandlebarsHelpers();
  }

  async ensureOutputDirectory() {
    try {
      await fs.access(this.outputPath);
    } catch (error) {
      await fs.mkdir(this.outputPath, { recursive: true });
    }
  }

  registerHandlebarsHelpers() {
    handlebars.registerHelper('formatValue', (value, format, unit) => {
      if (value === null || value === undefined || value === '') {
        return 'N/A';
      }

      let formattedValue = value;

      switch (format) {
        case 'percentage':
          formattedValue = parseFloat(value).toFixed(1);
          break;
        case 'decimal':
          formattedValue = parseFloat(value).toFixed(2);
          break;
        case 'number':
          formattedValue = Math.round(parseFloat(value));
          break;
        case 'time':
          formattedValue = Math.round(parseFloat(value));
          break;
        default:
          formattedValue = value;
      }

      return unit ? `${formattedValue} ${unit}` : formattedValue;
    });

    handlebars.registerHelper('getClassification', (value, classification) => {
      if (!classification || !classification.ranges) {
        return '';
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '';

      const range = classification.ranges.find(r => 
        numValue >= (r.min || 0) && numValue <= (r.max || Infinity)
      );

      return range ? {
        label: range.label,
        color: range.color
      } : '';
    });

    handlebars.registerHelper('formatDate', (timestamp) => {
      if (!timestamp) return 'N/A';
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });
  }

  extractValue(data, jsonPath) {
    try {
      if (jsonPath.startsWith('$.')) {
        const path = jsonPath.substring(2);

        if (path.includes('[?(@.')) {
          const match = path.match(/^(.+?)\[\?\(@\.(.+?)==(.+?)\)\](.*)$/);
          if (match) {
            const [, arrayPath, filterKey, filterValue, remainingPath] = match;
            const array = _.get(data, arrayPath);

            if (Array.isArray(array)) {
              const filteredItem = array.find(item => 
                _.get(item, filterKey) == filterValue
              );

              if (filteredItem && remainingPath) {
                return _.get(filteredItem, remainingPath.substring(1));
              }
              return filteredItem;
            }
          }
        }

        return _.get(data, path);
      }

      return _.get(data, jsonPath);
    } catch (error) {
      console.error(`Error extracting value from path ${jsonPath}:`, error);
      return null;
    }
  }

  processAssessmentData(data, config) {
    const processedData = {
      assessmentName: config.name,
      generatedAt: new Date().toISOString(),
      sessionId: data.session_id,
      sections: []
    };

    config.sections.forEach(sectionConfig => {
      if (!sectionConfig.enabled) return;

      const section = {
        id: sectionConfig.id,
        title: sectionConfig.title,
        fields: []
      };

      sectionConfig.fields.forEach(fieldConfig => {
        const value = this.extractValue(data, fieldConfig.jsonPath);

        section.fields.push({
          label: fieldConfig.label,
          value: value,
          format: fieldConfig.format,
          unit: fieldConfig.unit,
          classification: fieldConfig.classification
        });
      });

      processedData.sections.push(section);
    });

    return processedData;
  }

  async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async generateReport(sessionId) {
    try {
      const data = assessmentData.find(item => item.session_id === sessionId);
      if (!data) {
        throw new Error(`Assessment data not found for session: ${sessionId}`);
      }

      const config = assessmentConfig[data.assessment_id];
      if (!config) {
        throw new Error(`Configuration not found for assessment: ${data.assessment_id}`);
      }

      const processedData = this.processAssessmentData(data, config);

      const templatePath = path.join(this.templatesPath, 'assessment-report.hbs');
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const template = handlebars.compile(templateContent);

      const html = template(processedData);

      const browser = await this.getBrowser();
      const page = await browser.newPage();

      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      await page.close();

      const filename = `assessment-report-${sessionId}-${Date.now()}.pdf`;
      const outputFilePath = path.join(this.outputPath, filename);

      await fs.writeFile(outputFilePath, pdfBuffer);

      return {
        success: true,
        filename,
        filePath: outputFilePath,
        assessmentType: config.name,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }


  async getGeneratedReports() {
  try {
    const files = await fs.readdir(this.outputPath);

    const pdfFiles = await Promise.all(
      files
        .filter(file => file.endsWith('.pdf'))
        .map(async file => {
          const filePath = path.join(this.outputPath, file);
          const stats = await fs.stat(filePath); // get file stats
          return {
            filename: file,
            path: filePath,
            createdAt: stats.birthtime // or stats.mtime for modified time
          };
        })
    );

    // Sort reports by creation date descending (newest first)
    return pdfFiles.sort((a, b) => b.createdAt - a.createdAt);

  } catch (error) {
    console.error('Error getting generated reports:', error);
    return [];
  }
}

}

module.exports = new PDFGenerationService();





// const puppeteer = require('puppeteer');
// const handlebars = require('handlebars');
// const fs = require('fs').promises;
// const path = require('path');
// const _ = require('lodash');

// const assessmentConfig = require('../config/assessment-config');
// const assessmentData = require('../../data/data');

// class PDFGenerationService {
//   constructor() {
//     this.browser = null;
//     this.templatesPath = path.join(__dirname, '../templates');
//     this.outputPath = path.join(__dirname, '../generated-pdfs');
//     this.metadataPath = path.join(this.outputPath, 'report-metadata.json'); // Added metadata path

//     this.ensureOutputDirectory();
//     this.registerHandlebarsHelpers();
//   }

//   async ensureOutputDirectory() {
//     try {
//       await fs.access(this.outputPath);
//     } catch (error) {
//       await fs.mkdir(this.outputPath, { recursive: true });
//     }
//   }

//   registerHandlebarsHelpers() {
//     handlebars.registerHelper('formatValue', (value, format, unit) => {
//       if (value === null || value === undefined || value === '') {
//         return 'N/A';
//       }

//       let formattedValue = value;

//       switch (format) {
//         case 'percentage':
//           formattedValue = parseFloat(value).toFixed(1);
//           break;
//         case 'decimal':
//           formattedValue = parseFloat(value).toFixed(2);
//           break;
//         case 'number':
//           formattedValue = Math.round(parseFloat(value));
//           break;
//         case 'time':
//           formattedValue = Math.round(parseFloat(value));
//           break;
//         default:
//           formattedValue = value;
//       }

//       return unit ? `${formattedValue} ${unit}` : formattedValue;
//     });

//     handlebars.registerHelper('getClassification', (value, classification) => {
//       if (!classification || !classification.ranges) {
//         return '';
//       }

//       const numValue = parseFloat(value);
//       if (isNaN(numValue)) return '';

//       const range = classification.ranges.find(r =>
//         numValue >= (r.min || 0) && numValue <= (r.max || Infinity)
//       );

//       return range ? {
//         label: range.label,
//         color: range.color
//       } : '';
//     });

//     handlebars.registerHelper('formatDate', (timestamp) => {
//       if (!timestamp) return 'N/A';
//       return new Date(timestamp).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     });
//   }

//   extractValue(data, jsonPath) {
//     try {
//       if (jsonPath.startsWith('$.')) {
//         const path = jsonPath.substring(2);

//         if (path.includes('[?(@.')) {
//           const match = path.match(/^(.+?)\[\?\(@\.(.+?)==(.+?)\)\](.*)$/);
//           if (match) {
//             const [, arrayPath, filterKey, filterValue, remainingPath] = match;
//             const array = _.get(data, arrayPath);

//             if (Array.isArray(array)) {
//               const filteredItem = array.find(item =>
//                 _.get(item, filterKey) == filterValue
//               );

//               if (filteredItem && remainingPath) {
//                 return _.get(filteredItem, remainingPath.substring(1));
//               }
//               return filteredItem;
//             }
//           }
//         }

//         return _.get(data, path);
//       }

//       return _.get(data, jsonPath);
//     } catch (error) {
//       console.error(`Error extracting value from path ${jsonPath}:`, error);
//       return null;
//     }
//   }

//   processAssessmentData(data, config) {
//     const processedData = {
//       assessmentName: config.name,
//       generatedAt: new Date().toISOString(),
//       sessionId: data.session_id,
//       sections: []
//     };

//     config.sections.forEach(sectionConfig => {
//       if (!sectionConfig.enabled) return;

//       const section = {
//         id: sectionConfig.id,
//         title: sectionConfig.title,
//         fields: []
//       };

//       sectionConfig.fields.forEach(fieldConfig => {
//         const value = this.extractValue(data, fieldConfig.jsonPath);

//         section.fields.push({
//           label: fieldConfig.label,
//           value: value,
//           format: fieldConfig.format,
//           unit: fieldConfig.unit,
//           classification: fieldConfig.classification
//         });
//       });

//       processedData.sections.push(section);
//     });

//     return processedData;
//   }

//   async getBrowser() {
//     if (!this.browser) {
//       this.browser = await puppeteer.launch({
//         headless: 'new',
//         args: [
//           '--no-sandbox',
//           '--disable-setuid-sandbox',
//           '--disable-dev-shm-usage',
//           '--disable-accelerated-2d-canvas',
//           '--no-first-run',
//           '--no-zygote',
//           '--disable-gpu'
//         ]
//       });
//     }
//     return this.browser;
//   }

//   async generateReport(sessionId) {
//     try {
//       const data = assessmentData.find(item => item.session_id === sessionId);
//       if (!data) {
//         throw new Error(`Assessment data not found for session: ${sessionId}`);
//       }

//       const config = assessmentConfig[data.assessment_id];
//       if (!config) {
//         throw new Error(`Configuration not found for assessment: ${data.assessment_id}`);
//       }

//       const processedData = this.processAssessmentData(data, config);

//       const templatePath = path.join(this.templatesPath, 'assessment-report.hbs');
//       const templateContent = await fs.readFile(templatePath, 'utf8');
//       const template = handlebars.compile(templateContent);

//       const html = template(processedData);

//       const browser = await this.getBrowser();
//       const page = await browser.newPage();

//       await page.setContent(html, {
//         waitUntil: 'networkidle0'
//       });

//       const pdfBuffer = await page.pdf({
//         format: 'A4',
//         printBackground: true,
//         margin: {
//           top: '20px',
//           right: '20px',
//           bottom: '20px',
//           left: '20px'
//         }
//       });

//       await page.close();

//       const filename = `assessment-report-${sessionId}-${Date.now()}.pdf`;
//       const outputFilePath = path.join(this.outputPath, filename);

//       await fs.writeFile(outputFilePath, pdfBuffer);

//       // Persist metadata
//       let metadata = [];
//       try {
//         const json = await fs.readFile(this.metadataPath, 'utf8');
//         metadata = JSON.parse(json);
//       } catch {
//         metadata = [];
//       }

//       const generatedAt = new Date().toISOString();
//       metadata.push({
//         filename,
//         generatedAt,
//         assessmentType: config.name
//       });

//       await fs.writeFile(this.metadataPath, JSON.stringify(metadata, null, 2));

//       return {
//         success: true,
//         filename,
//         filePath: outputFilePath,
//         assessmentType: config.name,
//         generatedAt
//       };


//     } catch (error) {
//       console.error('PDF generation error:', error);
//       throw new Error(`PDF generation failed: ${error.message}`);
//     }
//   }

//   async cleanup() {
//     if (this.browser) {
//       await this.browser.close();
//       this.browser = null;
//     }
//   }

//   async getGeneratedReports() {
//     try {
//       const json = await fs.readFile(this.metadataPath, 'utf8');
//       const metadata = JSON.parse(json);
//       return metadata.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
//     } catch (error) {
//       console.error('Error reading report metadata:', error);
//       return [];
//     }
//   }
// }

// module.exports = new PDFGenerationService();
