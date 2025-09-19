const { asyncHandler } = require('../middleware/errorHandler');
const pdfService = require('../services/pdfService');
const assessmentData = require('../../data/data');
const assessmentConfig = require('../config/assessment-config');

const generateReport = asyncHandler(async (req, res) => {
  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required'
    });
  }

  try {
    const result = await pdfService.generateReport(session_id);

    res.json({
      success: true,
      message: 'PDF report generated successfully',
      data: result
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const generateReportGet = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID is required'
    });
  }

  try {
    const result = await pdfService.generateReport(sessionId);

    res.json({
      success: true,
      message: 'PDF report generated successfully',
      data: result
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const getSessions = asyncHandler(async (req, res) => {
  const sessions = assessmentData.map(item => ({
    session_id: item.session_id,
    assessment_id: item.assessment_id,
    assessment_name: assessmentConfig[item.assessment_id]?.name || 'Unknown Assessment',
    timestamp: item.timestamp,
    accuracy: item.accuracy,
    gender: item.gender,
    height: item.height,
    weight: item.weight
  }));

  res.json({
    success: true,
    data: {
      sessions,
      totalSessions: sessions.length
    }
  });
});

const getAssessmentConfig = asyncHandler(async (req, res) => {
  const { assessment_id } = req.query;

  if (assessment_id) {
    const config = assessmentConfig[assessment_id];
    if (!config) {
      return res.status(404).json({
        success: false,
        error: `Configuration not found for assessment: ${assessment_id}`
      });
    }

    return res.json({
      success: true,
      data: {
        assessment_id,
        config
      }
    });
  }

  const configSummary = Object.keys(assessmentConfig).map(key => ({
    assessment_id: key,
    name: assessmentConfig[key].name,
    sectionsCount: assessmentConfig[key].sections.length,
    totalFields: assessmentConfig[key].sections.reduce((total, section) => total + section.fields.length, 0)
  }));

  res.json({
    success: true,
    data: {
      configurations: configSummary,
      totalConfigurations: configSummary.length
    }
  });
});

const getGeneratedReports = asyncHandler(async (req, res) => {
  try {
    const reports = await pdfService.getGeneratedReports();

    res.json({
      success: true,
      data: {
        reports,
        totalReports: reports.length
      }
    });
  } catch (error) {
    console.error('Error fetching generated reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch generated reports'
    });
  }
});

const getSessionData = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const sessionData = assessmentData.find(item => item.session_id === sessionId);
  if (!sessionData) {
    return res.status(404).json({
      success: false,
      error: `Session not found: ${sessionId}`
    });
  }

  const config = assessmentConfig[sessionData.assessment_id];

  res.json({
    success: true,
    data: {
      session: sessionData,
      config: config || null,
      configAvailable: !!config
    }
  });
});

const testConfiguration = asyncHandler(async (req, res) => {
  try {
    const { session_id = 'session_001' } = req.query;

    const data = assessmentData.find(item => item.session_id === session_id);
    if (!data) {
      return res.status(404).json({
        success: false,
        error: `Test session not found: ${session_id}`
      });
    }

    const config = assessmentConfig[data.assessment_id];
    if (!config) {
      return res.status(404).json({
        success: false,
        error: `Configuration not found for assessment: ${data.assessment_id}`
      });
    }

    const processedData = pdfService.processAssessmentData(data, config);

    res.json({
      success: true,
      message: 'Configuration test successful',
      data: {
        originalData: {
          session_id: data.session_id,
          assessment_id: data.assessment_id,
          dataKeys: Object.keys(data)
        },
        configuration: {
          name: config.name,
          sectionsCount: config.sections.length,
          totalFields: config.sections.reduce((total, section) => total + section.fields.length, 0)
        },
        processedData
      }
    });
  } catch (error) {
    console.error('Configuration test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = {
  generateReport,
  generateReportGet,
  getSessions,
  getAssessmentConfig,
  getGeneratedReports,
  getSessionData,
  testConfiguration
};
