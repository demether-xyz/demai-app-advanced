import React from 'react'
import { useEventEmitter } from '@/hooks/useEvents'

interface PortfolioRefreshButtonProps {
  className?: string
  children?: React.ReactNode
}

export const PortfolioRefreshButton: React.FC<PortfolioRefreshButtonProps> = ({ 
  className = '', 
  children = 'Refresh Portfolio' 
}) => {
  const emit = useEventEmitter()

  const handleRefresh = () => {
    // Emit the portfolio update event - this will trigger the usePortfolio hook to refetch data
    emit('app.portfolio.update')
  }

  return (
    <button
      onClick={handleRefresh}
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

export default PortfolioRefreshButton 