import { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      verifyToken()
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/profile')
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.data.user,
          token: localStorage.getItem('token')
        }
      })
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      dispatch({ type: 'LOGOUT' })
    }
  }

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await api.post('/auth/login', { email, password })

      const { user, token } = response.data.data

      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      })

      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await api.post('/auth/register', userData)

      const { user, token } = response.data.data

      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      })

      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    dispatch({ type: 'LOGOUT' })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
