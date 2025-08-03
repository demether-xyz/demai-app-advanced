import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAuth } from './useAuth'
import { useEvent, EVENTS } from './useEvents'

// Use the same API base URL as other services
const API_BASE_URL = process.env.NEXT_PUBLIC_DEMAI_API_URL || 'http://localhost:5050'

export interface UserTask {
  _id: string
  user_address: string
  vault_address: string
  strategy_id: string
  amount: string
  params: Record<string, any>
  chain_id: number
  interval_hours: number
  status: 'active' | 'paused' | 'inactive' | 'failed'
  next_run: string
  last_run?: string
  last_result?: {
    success: boolean
    data?: Record<string, any>
    error?: string
    tx_hash?: string
    timestamp: string
  }
  created_at: string
  updated_at: string
}

export const useUserTasks = () => {
  const { address } = useAccount()
  const { authData } = useAuth()
  const [tasks, setTasks] = useState<UserTask[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Listen for strategy update events
  const strategyUpdateEvent = useEvent(EVENTS.STRATEGY_UPDATE)

  const fetchTasks = async () => {
    if (!address || !authData?.signature) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const url = `${API_BASE_URL}/strategies/tasks/?wallet_address=${address}&signature=${authData.signature}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        await response.text()
        throw new Error(`Failed to fetch tasks: ${response.status}`)
      }

      const data = await response.json()
      setTasks(data.tasks || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const pauseTask = async (taskId: string) => {
    if (!address || !authData?.signature) return false

    try {
      const response = await fetch(`${API_BASE_URL}/strategies/tasks/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: address,
          signature: authData.signature,
          task_id: taskId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to pause task')
      }

      // Refresh tasks after successful pause
      await fetchTasks()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause task')
      return false
    }
  }

  const resumeTask = async (taskId: string) => {
    if (!address || !authData?.signature) return false

    try {
      const response = await fetch(`${API_BASE_URL}/strategies/tasks/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: address,
          signature: authData.signature,
          task_id: taskId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to resume task')
      }

      // Refresh tasks after successful resume
      await fetchTasks()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume task')
      return false
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!address || !authData?.signature) return false

    try {
      const response = await fetch(`${API_BASE_URL}/strategies/tasks/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: address,
          signature: authData.signature,
          task_id: taskId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      // Refresh tasks after successful deletion
      await fetchTasks()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
      return false
    }
  }

  // Fetch tasks when component mounts and when address/signature changes
  useEffect(() => {
    if (address && authData?.signature) {
      fetchTasks()
    }
  }, [address, authData])

  // Refresh tasks when strategy update event is emitted
  useEffect(() => {
    if (strategyUpdateEvent > 0 && address && authData?.signature) {
      fetchTasks()
    }
  }, [strategyUpdateEvent, address, authData])

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    pauseTask,
    resumeTask,
    deleteTask,
  }
} 