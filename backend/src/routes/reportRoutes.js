const express = require('express');
const router = express.Router();

const {
  generateReport,
  generateReportGet,
  getSessions,
  getAssessmentConfig,
  getGeneratedReports,
  getSessionData,
  testConfiguration
} = require('../controllers/reportController');

const { protect } = require('../middleware/auth');

// All routes are protected (require authentication)
router.use(protect);

// Report generation routes
router.post('/generate-report', generateReport);
router.get('/generate-report/:sessionId', generateReportGet);

// Data and configuration routes
router.get('/sessions', getSessions);
router.get('/session/:sessionId', getSessionData);
router.get('/config', getAssessmentConfig);
router.get('/generated', getGeneratedReports);

// Testing routes
router.get('/test-config', testConfiguration);

module.exports = router;
