import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { DEMAI_AUTH_MESSAGE } from '@/components/DemaiAuthHandler'

interface AuthData {
  address: string
  signature: string
  message: string
}

interface UseAuthReturn {
  authData: AuthData | null
  isAuthenticated: boolean
  hasValidSignature: boolean
  clearAuth: () => void
}

export const useAuth = (): UseAuthReturn => {
  const { address } = useAccount()
  const [authData, setAuthData] = useState<AuthData | null>(null)
  const [hasValidSignature, setHasValidSignature] = useState(false)

  useEffect(() => {
    if (!address) {
      setAuthData(null)
      setHasValidSignature(false)
      return
    }

    // Get auth data from localStorage
    const storedData = localStorage.getItem('demai_auth_data')
    if (!storedData) {
      setAuthData(null)
      setHasValidSignature(false)
      return
    }

    try {
      const parsedAuthData = JSON.parse(storedData)
      
      // Validate the auth data
      const isValid = !!(
        parsedAuthData &&
        parsedAuthData.signature &&
        parsedAuthData.message === DEMAI_AUTH_MESSAGE &&
        parsedAuthData.address.toLowerCase() === address.toLowerCase()
      )

      if (isValid) {
        setAuthData(parsedAuthData)
        setHasValidSignature(true)
      } else {
        setAuthData(null)
        setHasValidSignature(false)
      }
    } catch (error) {
      console.error('Error parsing auth data:', error)
      setAuthData(null)
      setHasValidSignature(false)
    }
  }, [address])

  const clearAuth = () => {
    localStorage.removeItem('demai_auth_data')
    setAuthData(null)
    setHasValidSignature(false)
  }

  return {
    authData,
    isAuthenticated: !!authData,
    hasValidSignature,
    clearAuth
  }
}

// Helper function to get stored auth data (for backward compatibility)
export const getStoredAuthData = (): AuthData | null => {
  try {
    const storedData = localStorage.getItem('demai_auth_data')
    if (!storedData) return null
    
    const authData = JSON.parse(storedData)
    
    // Validate required fields
    if (!authData.address || !authData.signature || !authData.message) {
      return null
    }
    
    return authData
  } catch (error) {
    console.error('Error getting stored auth data:', error)
    return null
  }
} 