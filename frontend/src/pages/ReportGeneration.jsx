

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

import api from '../services/api'

const ReportGeneration = () => {
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedReports, setGeneratedReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [sessionsResponse, reportsResponse] = await Promise.all([
        api.get('/reports/sessions'),
        api.get('/reports/generated')
      ])

      setSessions(sessionsResponse.data.data.sessions)
      setGeneratedReports(reportsResponse.data.data.reports)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSessionSelect = async (sessionId) => {
    setSelectedSession(sessionId)
    if (sessionId) {
      try {
        const response = await api.get(`/reports/session/${sessionId}`)
        setSessionData(response.data.data)
      } catch (error) {
        console.error('Error fetching session data:', error)
        toast.error('Failed to load session data')
      }
    } else {
      setSessionData(null)
    }
  }

  const generateReport = async () => {
    if (!selectedSession) {
      toast.error('Please select a session')
      return
    }

    setGenerating(true)
    try {
      await api.post('/reports/generate-report', {
        session_id: selectedSession
      })

      toast.success('Report generated successfully!')

      const reportsResponse = await api.get('/reports/generated')
      setGeneratedReports(reportsResponse.data.data.reports)

    } catch (error) {
      console.error('Error generating report:', error)
      const errorMessage = error.response?.data?.error || 'Failed to generate report'
      toast.error(errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  const testConfiguration = async () => {
    try {
      const response = await api.get('/reports/test-config', {
        params: { session_id: selectedSession || 'session_001' }
      })

      toast.success('Configuration test successful!')
      console.log('Configuration test result:', response.data)
    } catch (error) {
      console.error('Configuration test failed:', error)
      toast.error('Configuration test failed')
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Report Generation
        </h1>
        <p className="text-gray-600 text-lg">
          Generate PDF reports from assessment data using our configuration-driven system
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Select Assessment Session
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Sessions ({sessions.length})
              </label>
              <select
                value={selectedSession}
                onChange={(e) => handleSessionSelect(e.target.value)}
                className="input-field"
              >
                <option value="">Choose a session...</option>
                {sessions.map((session) => (
                  <option key={session.session_id} value={session.session_id}>
                    {session.session_id} - {session.assessment_name} ({session.accuracy}% accuracy)
                  </option>
                ))}
              </select>
            </div>

            {sessionData && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Session Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">Assessment Type:</span>
                    <p className="text-blue-800">{sessionData.session.assessment_id}</p>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Accuracy:</span>
                    <p className="text-blue-800">{sessionData.session.accuracy}%</p>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Gender:</span>
                    <p className="text-blue-800 capitalize">{sessionData.session.gender}</p>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Height/Weight:</span>
                    <p className="text-blue-800">{sessionData.session.height}cm / {sessionData.session.weight}kg</p>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Configuration:</span>
                    <div className="flex items-center">
                      {sessionData.configAvailable ? (
                        <>
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-700">Available</span>
                        </>
                      ) : (
                        <>
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-red-700">Missing</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4 mt-6">
              <button
                onClick={generateReport}
                disabled={!selectedSession || generating}
                className="btn btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Generate PDF Report
                  </>
                )}
              </button>

              <button
                onClick={testConfiguration}
                disabled={generating}
                className="btn btn-secondary flex items-center disabled:opacity-50"
              >
                <EyeIcon className="h-5 w-5 mr-2" />
                Test Configuration
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Configuration System Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">✅ Flexible Sections</h3>
                <p className="text-sm text-green-700">
                  Different assessment types show different sections automatically
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">✅ Dynamic Field Mapping</h3>
                <p className="text-sm text-blue-700">
                  JSON path expressions map data fields dynamically
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">✅ Value Classification</h3>
                <p className="text-sm text-purple-700">
                  Configurable ranges classify values with color coding
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">✅ No Code Changes</h3>
                <p className="text-sm text-orange-700">
                  Add new assessment types through configuration only
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Generated Reports
            </h2>

            {generatedReports.length > 0 ? (
              <div className="space-y-3">
                {generatedReports.slice(0, 10).map((report, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {report.filename}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {formatDate(report.createdAt)}
                        </div>
                      </div>
                      {/* Download button now triggers Save As */}
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/reports/files/${report.filename}`}
                        className="ml-2 text-blue-600 hover:text-blue-700"
                        download
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}

                {generatedReports.length > 10 && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    And {generatedReports.length - 10} more...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No reports generated yet</p>
                <p className="text-sm text-gray-500">
                  Generate your first report to see it here
                </p>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Supported Assessment Types
            </h2>

            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h3 className="font-medium text-blue-900">Health & Fitness Assessment</h3>
                <p className="text-xs text-blue-700 mt-1">
                  ID: as_hr_02 • 6 sections • 25+ fields
                </p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <h3 className="font-medium text-green-900">Cardiac Assessment</h3>
                <p className="text-xs text-green-700 mt-1">
                  ID: as_card_01 • 4 sections • 15+ fields
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-600">
                💡 New assessment types can be added by updating the configuration file only - no code changes required!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportGeneration
