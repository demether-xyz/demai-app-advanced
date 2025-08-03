// src/demai/services/demaiApi.ts
import { getStoredAuthData } from '../hooks/useAuth'
import { PortfolioData } from '../store'

// Define the base URL for the Demai API
// Use an environment variable if available, otherwise default to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_DEMAI_API_URL || 'http://localhost:5050'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// This interface is not used anymore since we return the raw API response
// The actual response structure matches PortfolioData from the store

// Function to store authentication data to localStorage
export const storeAuthData = (authData: { signature: string; message: string; address: string }): void => {
  localStorage.setItem('demai_auth_data', JSON.stringify(authData))
}

// Function to send a message to the AI chat endpoint
export const sendMessageToDemai = async (
  message: string, 
  _walletAddress?: string, 
  vaultAddress?: string,
  returnIntermediateSteps: boolean = true
): Promise<ApiResponse<{ text: string; messages?: Array<{type: string; content: string; tool?: string; step?: number}> }>> => {
  try {
    // Get authentication data from localStorage
    const authData = getStoredAuthData()
    if (!authData) {
      return { success: false, error: 'User is not authenticated.' }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const body = JSON.stringify({
      message,
      wallet_address: authData.address,
      vault_address: vaultAddress,
      signature: authData.signature,
      return_intermediate_steps: returnIntermediateSteps,
    });

    const response = await fetch(`${API_BASE_URL}/chat/`, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.detail || 'Network response was not ok' };
    }

    const data = await response.json();
    
    // Handle both response formats
    if (returnIntermediateSteps && data.response && typeof data.response === 'object' && 'messages' in data.response) {
      return { success: true, data: data.response };
    } else {
      // Backward compatibility - wrap single response in messages array
      return { 
        success: true, 
        data: { 
          text: data.response,
          messages: [{ type: 'final', content: data.response }]
        } 
      };
    }
  } catch (error) {
    console.error('Failed to send message to Demai API:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred' };
  }
};

// Function to get portfolio data
export const getPortfolioData = async (
  walletAddress: string,
  refresh: boolean = false
): Promise<ApiResponse<PortfolioData>> => {
  try {
    const authData = getStoredAuthData()
    
    if (!authData) {
      return { success: false, error: 'User is not authenticated.' }
    }

    const requestBody = {
      wallet_address: walletAddress,
      signature: authData.signature,
      refresh: refresh,
    }

    const response = await fetch(`${API_BASE_URL}/portfolio/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error || 'Failed to fetch portfolio data.' }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Failed to fetch portfolio data.' }
  }
}

// Function to get strategies
export const getStrategies = async (): Promise<ApiResponse<{ strategies: any[] }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/strategies/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.error || 'Failed to fetch strategies.' }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Failed to fetch strategies from Demai API:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

// Function to get user's strategy subscriptions
export const getStrategySubscriptions = async (walletAddress: string): Promise<ApiResponse<{ subscriptions: any[] }>> => {
  try {
    const authData = getStoredAuthData()
    if (!authData) {
      return { success: false, error: 'User is not authenticated.' }
    }

    const response = await fetch(`${API_BASE_URL}/strategies/subscriptions?wallet_address=${walletAddress}&signature=${authData.signature}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.detail || 'Failed to fetch subscriptions.' }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Failed to fetch subscriptions from Demai API:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

// Function to subscribe to a strategy
export const subscribeToStrategy = async (
  walletAddress: string,
  vaultAddress: string,
  strategyId: string,
  percentage: number,
  chain: string,
  enabled: boolean = true
): Promise<ApiResponse<any>> => {
  try {
    const authData = getStoredAuthData()
    if (!authData) {
      return { success: false, error: 'User is not authenticated.' }
    }

    const response = await fetch(`${API_BASE_URL}/strategies/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
        vault_address: vaultAddress,
        signature: authData.signature,
        strategy_id: strategyId,
        percentage: percentage,
        chain: chain,
        enabled: enabled,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.detail || 'Failed to subscribe to strategy.' }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Failed to subscribe to strategy:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

// Function to update a strategy subscription
export const updateStrategySubscription = async (
  walletAddress: string,
  taskId: string,
  updates: { percentage?: number; enabled?: boolean }
): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const authData = getStoredAuthData()
    if (!authData) {
      return { success: false, error: 'User is not authenticated.' }
    }

    const response = await fetch(`${API_BASE_URL}/strategies/subscriptions/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
        signature: authData.signature,
        task_id: taskId,
        ...updates,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.detail || 'Failed to update subscription.' }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Failed to update subscription:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

// Function to delete a strategy subscription
export const deleteStrategySubscription = async (
  walletAddress: string,
  taskId: string
): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const authData = getStoredAuthData()
    if (!authData) {
      return { success: false, error: 'User is not authenticated.' }
    }

    const response = await fetch(`${API_BASE_URL}/strategies/subscriptions/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: walletAddress,
        signature: authData.signature,
        task_id: taskId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.detail || 'Failed to delete subscription.' }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Failed to delete subscription:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}
