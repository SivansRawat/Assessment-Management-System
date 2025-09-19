import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, sessionsResponse] = await Promise.all([
        api.get('/auth/stats'),
        api.get('/reports/sessions')
      ])

      setStats(statsResponse.data.data)
      setSessions(sessionsResponse.data.data.sessions.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
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

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: UserGroupIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Available Sessions',
      value: sessions.length || 0,
      icon: DocumentTextIcon,
      color: 'bg-green-500'
    },
    {
      title: 'System Uptime',
      value: `${Math.floor((stats?.systemInfo?.uptime || 0) / 3600)}h`,
      icon: ClockIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Environment',
      value: stats?.systemInfo?.environment || 'dev',
      icon: ChartBarIcon,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          Ready to generate some assessment reports? Let's get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.color} text-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Sessions</h2>
            <Link 
              to="/reports"
              className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium"
            >
              View All
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div 
                  key={session.session_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {session.assessment_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      ID: {session.session_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(session.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">
                      {session.accuracy}% accuracy
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.gender}, {session.height}cm
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No sessions available</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>

          <div className="space-y-4">
            <Link
              to="/reports"
              className="block p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Generate Report</p>
                  <p className="text-sm text-gray-600">
                    Create PDF reports from assessment data
                  </p>
                </div>
              </div>
            </Link>

            <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-gray-400" />
                <div className="ml-4">
                  <p className="font-medium text-gray-500">View Analytics</p>
                  <p className="text-sm text-gray-400">
                    Coming soon - Assessment analytics dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">System Information</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Version: {stats?.systemInfo?.version || '1.0.0'}</p>
              <p>Environment: {stats?.systemInfo?.environment || 'development'}</p>
              <p>Uptime: {Math.floor((stats?.systemInfo?.uptime || 0) / 60)} minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
