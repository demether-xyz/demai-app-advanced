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

// Function to store authentication data to localStorage
export const storeAuthData = (authData: { signature: string; message: string; address: string }): void => {
  localStorage.setItem('demai_auth_data', JSON.stringify(authData))
}

// Function to send a message to the AI chat endpoint
export const sendMessageToDemai = async (message: string, walletAddress?: string, vaultAddress?: string): Promise<ApiResponse<{ text: string; windows?: string[] }>> => {
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
    return { success: true, data: data.response };
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
  vaultAddress: string,
  refresh: boolean = false
): Promise<ApiResponse<PortfolioData>> => {
  try {
    const authData = getStoredAuthData()
    if (!authData) {
      return { success: false, error: 'User is not authenticated.' }
    }

    // The backend expects a POST request with signature
    const response = await fetch(`${API_BASE_URL}/portfolio/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vault_address: vaultAddress,
        wallet_address: authData.address,
        signature: authData.signature,
        refresh: refresh, // Pass refresh flag to the backend
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.detail || 'Network response was not ok' }
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Failed to fetch portfolio data:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}
