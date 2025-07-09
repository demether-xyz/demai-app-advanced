import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAuth } from './useAuth'
import { useEvent, EVENTS } from './useEvents'

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
      console.log('useUserTasks: Missing address or signature', { address, hasSignature: !!authData?.signature })
      return
    }

    console.log('useUserTasks: Fetching tasks for address:', address)
    setIsLoading(true)
    setError(null)

    try {
      const url = `http://localhost:5050/strategies/tasks/?wallet_address=${address}&signature=${authData.signature}`
      console.log('useUserTasks: Fetching from URL:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('useUserTasks: API error:', response.status, errorText)
        throw new Error(`Failed to fetch tasks: ${response.status}`)
      }

      const data = await response.json()
      console.log('useUserTasks: Received data:', data)
      setTasks(data.tasks || [])
    } catch (err) {
      console.error('useUserTasks: Error fetching tasks:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const pauseTask = async (taskId: string) => {
    if (!address || !authData?.signature) return false

    try {
      const response = await fetch(`http://localhost:5050/strategies/tasks/pause`, {
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
      const response = await fetch(`http://localhost:5050/strategies/tasks/resume`, {
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
      const response = await fetch(`http://localhost:5050/strategies/tasks/delete`, {
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
      console.log('useUserTasks: Refreshing tasks due to strategy update event')
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