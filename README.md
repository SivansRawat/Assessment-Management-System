# Assessment Management System

A comprehensive full-stack application for generating PDF reports from assessment data with a completely configuration-driven system. Built with React.js, Node.js, Express, and Puppeteer.

## 🚀 Features

### Core Functionality
- **User Authentication System** - JWT-based registration and login
- **PDF Report Generation** - Automated PDF creation using Puppeteer
- **Configuration-Driven Architecture** - No code changes needed for new assessment types
- **Dynamic Field Mapping** - JSON path expressions for flexible data extraction
- **Value Classification** - Configurable ranges with color-coded classifications
- **Responsive UI** - Modern React interface with Tailwind CSS

### Key Benefits
- ✅ **Maximum Flexibility** - Add new assessment types through configuration only
- ✅ **No Code Modifications** - All changes handled through configuration files
- ✅ **Dynamic Data Mapping** - JSON paths allow complex data extraction
- ✅ **Professional PDFs** - Beautifully formatted reports with classifications
- ✅ **Secure Authentication** - JWT tokens with proper validation
- ✅ **Modern Stack** - React 18, Node.js, Express, Tailwind CSS

## 🏗️ Architecture

```
Assessment Management System/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Assessment configurations
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Authentication & error handling
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic (PDF generation)
│   │   └── templates/     # Handlebars templates for PDFs
│   ├── data/              # Sample assessment data
│   └── generated-pdfs/    # Generated PDF files
└── frontend/              # React.js application
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── context/       # React context (Auth)
    │   ├── pages/         # Application pages
    │   ├── services/      # API services
    └── └── utils/         # Utility functions
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **Puppeteer** - PDF generation
- **Handlebars** - Template engine
- **Bcrypt** - Password hashing
- **Joi** - Input validation

### Frontend
- **React 18** - UI library
- **Tailwind CSS** - Styling framework
- **React Router** - Navigation
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## 📋 Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Git (for cloning)

## 🚀 Quick Start

### 1. Extract and Setup
```bash
# Extract the zip file
unzip assessment-management-system-complete.zip
cd assessment-management-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start the Applications
```bash
# Terminal 1: Start backend server
cd backend
npm run dev
# Server runs on http://localhost:5000

# Terminal 2: Start frontend
cd frontend
npm run dev
# App runs on http://localhost:3000
```

### 3. Test the System
1. Open browser to `http://localhost:3000`
2. Register a new account or use demo credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Navigate to "Report Generation"
4. Select a session (session_001 or session_002)
5. Click "Generate PDF Report"
6. Check the `backend/src/generated-pdfs/` folder for your PDF!

## 📊 Sample Data

The system includes two sample assessment sessions:

### Health & Fitness Assessment (session_001)
- Assessment ID: `as_hr_02`
- Sections: Overview, Vitals, Heart Health, Fitness, Posture, Body Composition
- 25+ configurable fields with classifications

### Cardiac Assessment (session_002)  
- Assessment ID: `as_card_01`
- Sections: Overview, Vitals, Cardiovascular Endurance, Body Composition
- 15+ configurable fields with classifications

## 🔧 Configuration System

### Adding New Assessment Types

1. **Update Configuration** (`backend/src/config/assessment-config.js`):
```javascript
"new_assessment_id": {
  "name": "New Assessment Type",
  "sections": [
    {
      "id": "section1",
      "title": "Section Title",
      "enabled": true,
      "fields": [
        {
          "label": "Field Label",
          "jsonPath": "$.path.to.data",
          "format": "number",
          "unit": "units",
          "classification": {
            "ranges": [
              {"min": 0, "max": 50, "label": "Low", "color": "blue"},
              {"min": 50, "max": 100, "label": "High", "color": "red"}
            ]
          }
        }
      ]
    }
  ]
}
```

2. **Add Sample Data** (`backend/data/data.js`):
```javascript
{
  "session_id": "new_session",
  "assessment_id": "new_assessment_id",
  // ... your data structure
}
```

3. **No Code Changes Required!** The system automatically:
   - Detects new configurations
   - Maps data using JSON paths
   - Generates appropriate PDF sections
   - Applies classifications and formatting

## 🧪 Testing

### Manual Testing Steps
1. **Authentication**: Register → Login → Access dashboard
2. **Data Loading**: Verify sessions load correctly
3. **Report Generation**: Generate PDFs for both assessment types
4. **Configuration**: Test with different session IDs

## 📞 Support

For questions or support:
- Check the troubleshooting section
- Review the configuration examples
- Test with the provided sample data
- Verify all environment variables are set correctly

---

## 🎯 Demo Walkthrough

1. **Start both servers** (backend on :5000, frontend on :3000)
2. **Register/Login** with the authentication system
3. **View Dashboard** to see system overview
4. **Generate Reports**:
   - Select `session_001` (Health & Fitness)
   - Click "Generate PDF Report"
   - Check `backend/src/generated-pdfs/` folder
   - Try `session_002` (Cardiac Assessment)

The system demonstrates complete configuration-driven flexibility - no code changes needed for new assessment types! 🚀
