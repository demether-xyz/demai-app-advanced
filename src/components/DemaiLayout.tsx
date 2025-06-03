import React from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '../config/wagmi'

interface DemaiLayoutProps {
  children: React.ReactNode
}

const queryClient = new QueryClient()

// Main layout component that provides the providers and basic structure
const DemaiLayout: React.FC<DemaiLayoutProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="h-screen w-full bg-black">{children}</div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default DemaiLayout
