// src/demai/services/demaiApi.ts

// Define the base URL for the Demai API
// Use an environment variable if available, otherwise default to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_DEMAI_API_URL || 'http://localhost:5050'

interface AuthData {
  signature: string
  message: string
  address: string
}

interface ApiResponse {
  success: boolean
  message?: string
  error?: string
  data?: {
    text: string
    windows?: string[]
  }
}

interface PortfolioResponse {
  success: boolean
  data?: {
    vault_address: string
    total_value_usd: number
    holdings: Array<{
      symbol: string
      name: string
      chain_id: number
      balance: number
      price_usd: number
      value_usd: number
      type?: string
      strategy?: string
      protocol?: string
      strategy_type?: string
    }>
    chains_count: number
    tokens_count: number
    strategy_count: number
    active_strategies: string[]
  }
  error?: string
}

// Function to get stored authentication data from localStorage
export const getStoredAuthData = (): AuthData | null => {
  try {
    const data = localStorage.getItem('demai_auth_data')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

// Function to store authentication data to localStorage
export const storeAuthData = (authData: AuthData): void => {
  localStorage.setItem('demai_auth_data', JSON.stringify(authData))
}

// Function to send a message to the AI chat endpoint
export const sendMessageToDemai = async (message: string): Promise<ApiResponse> => {
  try {
    // TODO: Re-enable authentication for production
    // Get authentication data
    // const authData = getStoredAuthData()
    // if (!authData) {
    //   return {
    //     success: false,
    //     error: 'No authentication data found. Please connect your wallet and sign the message.',
    //   }
    // }

    // Construct the full endpoint URL
    const endpointUrl = `${API_BASE_URL}/chat/`

    try {
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          wallet_address: 'dev-address', // Dummy address for development
          signature: 'dev-signature', // Dummy signature for development
          auth_message: 'dev-message', // Dummy auth message for development
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }))
        if (response.status === 401) {
          return {
            success: false,
            error: errorData.detail || 'Invalid wallet authentication. Please reconnect your wallet.',
          }
        }
        return {
          success: false,
          error: errorData.detail || `Server error! Status: ${response.status}`,
        }
      }

      const data = await response.json()

      // The backend returns a response field containing JSON string
      if (!data || typeof data.response !== 'string') {
        return {
          success: false,
          error: 'Invalid response format from server.',
        }
      }

      // Parse the JSON response from the backend
      try {
        const parsedResponse = JSON.parse(data.response)
        
        if (parsedResponse && parsedResponse.text) {
          return {
            success: true,
            data: {
              text: parsedResponse.text,
              windows: parsedResponse.windows || []
            }
          }
        } else {
          // Fallback if parsing fails
          return {
            success: true,
            message: data.response,
          }
        }
      } catch (parseError) {
        // If JSON parsing fails, treat as plain text
        return {
          success: true,
          message: data.response,
        }
      }
    } catch (fetchError) {
      // Handle network-related errors specifically
      if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
        return {
          success: false,
          error: 'Unable to connect to the Demai API. Please check if the service is running and try again.',
        }
      }
      return {
        success: false,
        error: fetchError instanceof Error ? fetchError.message : 'Network error occurred',
      }
    }
  } catch (error) {
    console.error('Error sending message to Demai:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while sending the message.',
    }
  }
}

// Function to get portfolio data
export const getPortfolioData = async (vaultAddress: string): Promise<PortfolioResponse> => {
  try {
    // TODO: Re-enable authentication for production
    // Get authentication data
    // const authData = getStoredAuthData()
    // if (!authData) {
    //   return {
    //     success: false,
    //     error: 'No authentication data found. Please connect your wallet and sign the message.',
    //   }
    // }

    // Construct the full endpoint URL
    const endpointUrl = `${API_BASE_URL}/portfolio/`

    try {
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vault_address: vaultAddress,
          signature: 'dev-signature', // Dummy signature for development
          auth_message: 'dev-message', // Dummy auth message for development
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }))
        if (response.status === 401) {
          return {
            success: false,
            error: errorData.detail || 'Invalid wallet authentication. Please reconnect your wallet.',
          }
        }
        return {
          success: false,
          error: errorData.detail || `Server error! Status: ${response.status}`,
        }
      }

      const data = await response.json()

      return {
        success: true,
        data: data
      }
    } catch (fetchError) {
      // Handle network-related errors specifically
      if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
        return {
          success: false,
          error: 'Unable to connect to the portfolio service. Please check if the service is running and try again.',
        }
      }
      return {
        success: false,
        error: fetchError instanceof Error ? fetchError.message : 'Network error occurred',
      }
    }
  } catch (error) {
    console.error('Error getting portfolio data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred while getting portfolio data.',
    }
  }
}
