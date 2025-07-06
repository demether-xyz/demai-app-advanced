/*
 * GENERIC CARD SURFACING SYSTEM WITH UNIQUE TIMESTAMPS
 * ===================================================
 *
 * This system allows ANY part of the app to surface ANY card by ID with unique timestamp tracking.
 *
 * How it works:
 * 1. Backend provides card data (any structure, any IDs)
 * 2. WireframeOverlay automatically detects all available card IDs
 * 3. Any component can surface a card using: surfaceCard(cardId)
 * 4. Each request gets a unique timestamp: cardId + timestamp
 * 5. Cards fly in with Minority Report-style animations
 * 6. System prevents duplicate processing using timestamp comparison
 *
 * Event Structure:
 * {
 *   cardId: "high-yield",
 *   timestamp: 1703123456789,
 *   count: 3
 * }
 *
 * Examples of usage:
 * - AI Chat: "Looking at your Aave position..." → surfaceCard('aave-position')
 * - Risk Alert: High risk detected → surfaceCard('risk-analysis')
 * - Notifications: Portfolio updated → surfaceCard('portfolio')
 * - User action: Click yield → surfaceCard('yield-opportunity-123')
 *
 * Benefits:
 * - Unique events prevent processing duplicates
 * - Timestamp tracking ensures proper sequencing
 * - Multiple rapid calls to same card work correctly
 * - Cross-component communication is reliable
 * - Backend integration is seamless
 */

import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import DemaiAuthHandler from '@/components/DemaiAuthHandler'
import { useAuth } from '@/hooks/useAuth'
import DemaiNavbar from '@/components/DemaiNavbar'
import DemaiChatInterface from '@/components/DemaiChatInterface'
import DashboardCard from '@/components/DashboardCard'
import FlowingChart from '@/components/FlowingChart'
import CircularProgress from '@/components/CircularProgress'
import WireframeOverlay from '@/components/WireframeOverlay'
import AutomationIndicator from '@/components/AutomationIndicator'
import VaultModal from '@/components/VaultModal'
import { useSurfaceCard, useEvent, useEventEmitter } from '@/hooks/useEvents'
import { useOpenWindow } from '@/hooks/useEvents'
import { usePortfolio } from '@/hooks/usePortfolio'
import { PortfolioData, PortfolioHolding } from '@/store'

const DemaiPage = () => {
  const { isConnected, address } = useAccount()
  const { hasValidSignature } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false)
  
  // Use the portfolio hook instead of local state
  const { portfolioData, refreshPortfolio, isVaultLoading, hasVault, vaultAddress } = usePortfolio(isConnected && hasValidSignature)
  
  // Listen for vault modal events
  const vaultOpenEvent = useEvent('vault.open')
  const emit = useEventEmitter()
  const openWindow = useOpenWindow()
  
  // Handle vault modal open event
  useEffect(() => {
    if (vaultOpenEvent > 0) {
      setIsVaultModalOpen(true)
    }
  }, [vaultOpenEvent])

  // Handle mounting state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auth logic is now handled by useAuth hook

  // Show main app when connected and authenticated
  const shouldShowMainApp = isConnected && hasValidSignature

  // Portfolio data is now managed by the usePortfolio hook

  // Format currency values with smart decimal places based on value size
  const formatCurrency = (value: number) => {
    if (value === 0) return '$0.00'
    
    // Determine decimal places based on value size
    let decimals = 2
    if (value < 1) {
      decimals = 6  // Show 6 decimals for values less than $1
    } else if (value < 10) {
      decimals = 4  // Show 4 decimals for values less than $10
    } else if (value < 1000) {
      decimals = 3  // Show 3 decimals for values less than $1000
    }
    // Values >= $1000 keep 2 decimals (default)
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  }

  // Don't render anything until mounted
  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Auth handler shows itself when wallet is connected but not authenticated */}
      <DemaiAuthHandler
        onSignatureUpdate={() => {
          // Auth state is now managed by useAuth hook
        }}
      />
      
      {/* Main app content - always render navbar so RainbowKit connect button works */}
      <div className="relative flex h-screen w-full flex-col overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/background.jpg)',
          }}
        />

        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Navbar - Fixed at top - ALWAYS visible so RainbowKit works */}
        <div className="relative z-10">
          <DemaiNavbar />
        </div>

        {/* Main Content Area - Only show when authenticated */}
        {shouldShowMainApp && (
          <div className="relative z-10 flex-1 overflow-hidden">
            {/* Dashboard Content as background */}
            <div className="absolute inset-0 overflow-y-auto p-8">
              {/* Portfolio Summary - Upper Left */}
              <div className="absolute top-8 left-12">
                <h1 className="mb-6 text-4xl font-bold text-white">demAI</h1>

                {/* Portfolio Value */}
                <div className="mb-4">
                  <div className="mb-2 text-5xl font-bold text-white">
                    {portfolioData.isLoading || isVaultLoading
                      ? 'Loading...' 
                      : !hasVault
                        ? '$0.00'
                        : portfolioData.error 
                          ? '$0.00'
                          : formatCurrency(portfolioData.total_value_usd)
                    }
                  </div>
                  

                  
                  <div className="mb-1 text-lg font-medium text-white/70 flex items-center">
                    <span>
                      {portfolioData.isLoading || isVaultLoading
                        ? 'Fetching portfolio data...'
                        : !hasVault
                          ? 'No vault deployed yet'
                          : portfolioData.error
                            ? 'Unable to load portfolio'
                            : `Across ${Object.keys(portfolioData.chains || {}).length} chains`
                      }
                    </span>
                    {!portfolioData.isLoading && !isVaultLoading && hasVault && !portfolioData.error && (
                      <button
                        onClick={refreshPortfolio}
                        className="ml-2 rounded p-1 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
                        title="Refresh portfolio data"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center text-sm font-medium text-green-400">
                    <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {portfolioData.isLoading || isVaultLoading
                      ? 'Loading...'
                      : !hasVault
                        ? 'Deploy a vault to start'
                        : portfolioData.error
                          ? 'Data unavailable'
                          : Object.keys(portfolioData.strategies || {}).length > 0
                            ? `${portfolioData.summary?.total_tokens || 0} tokens, ${Object.keys(portfolioData.strategies || {}).length} strategies (${formatCurrency(Object.values(portfolioData.strategies || {}).reduce((sum, s) => sum + (s.total_value_usd || 0), 0))})`
                            : `${portfolioData.summary?.total_tokens || 0} tokens`
                    }
                  </div>
                  

                </div>

                {/* AI Suggestions - DISABLED 
                <div className="mt-6 space-y-3">
                  <div className="flex max-w-md items-start space-x-3 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                    <div className="mt-0.5 rounded-full bg-blue-500 p-1.5">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">demAI suggests:</div>
                      <div className="text-sm text-white/90">Review your Aave position</div>
                    </div>
                  </div>

                  <div className="flex max-w-md items-start space-x-3 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                    <div className="mt-0.5 rounded-full bg-amber-500 p-1.5">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-white/90 italic">&ldquo;Your ETH position could benefit from rebalancing&rdquo;</div>
                    </div>
                  </div>
                </div>
                */}
              </div>

              {/* Quick Action Cards - Lower Left */}
              <div className="absolute bottom-8 left-12 flex space-x-4 z-20">
                <div 
                  onClick={() => emit('vault.open')}
                  className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-xl bg-green-600 p-5 transition-colors hover:bg-green-700"
                >
                  <svg className="mb-2 h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span className="text-center text-xs font-medium text-white">Vault</span>
                </div>

                <div 
                  onClick={() => openWindow('portfolio')}
                  className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-xl bg-purple-600 p-5 transition-colors hover:bg-purple-700"
                >
                  <svg className="mb-2 h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span className="text-center text-xs font-medium text-white">Analyze Portfolio</span>
                </div>
              </div>

              {/* Running Automation Indicators - Scattered like target design - Dynamic from portfolio data */}
              {/* REMOVED Automation Indicators as per user request
              {(() => {
                // Get strategy holdings from portfolio data - extract from strategies object
                const strategyHoldings = Object.values(portfolioData.strategies || {}).map(strategy => ({
                  symbol: Object.keys(strategy.positions || {})[0] || 'UNKNOWN',
                  name: `${strategy.protocol} ${strategy.strategy}`,
                  chain_id: 42161, // Default to Arbitrum for now
                  balance: 0,
                  price_usd: 0,
                  value_usd: strategy.total_value_usd,
                  type: 'strategy',
                  protocol: strategy.protocol,
                  strategy: strategy.strategy,
                  strategy_type: strategy.strategy
                }))
                
                // Available positions for scattering indicators
                const positions = [
                  "top-32 left-1/3",
                  "top-48 right-1/4", 
                  "bottom-1/3 left-1/2",
                  "top-1/2 left-2/3",
                  "bottom-1/4 right-1/3",
                  "top-1/4 right-1/2",
                  "bottom-1/2 left-1/4",
                  "top-2/3 right-1/5"
                ]

                // Protocol to display mapping
                const getProtocolDisplay = (protocol?: string, strategy?: string) => {
                  const protocolMap: { [key: string]: string } = {
                    'aave': 'Aave',
                    'aave_v3': 'Aave V3',
                    'compound': 'Compound',
                    'curve': 'Curve',
                    'yearn': 'Yearn',
                    'uniswap': 'Uniswap',
                    'uniswap_v3': 'Uniswap V3'
                  }
                  return protocolMap[protocol || ''] || protocolMap[strategy || ''] || protocol || strategy || 'DeFi'
                }

                // Protocol to color mapping
                const getProtocolColor = (protocol?: string, strategy?: string) => {
                  const colorMap: { [key: string]: string } = {
                    'aave': 'bg-blue-500',
                    'aave_v3': 'bg-blue-500',
                    'compound': 'bg-green-500',
                    'curve': 'bg-purple-500',
                    'yearn': 'bg-orange-500',
                    'uniswap': 'bg-cyan-500',
                    'uniswap_v3': 'bg-cyan-500'
                  }
                  return colorMap[protocol || ''] || colorMap[strategy || ''] || 'bg-gray-500'
                }

                // Protocol to icon mapping
                const getProtocolIcon = (protocol?: string, strategy?: string) => {
                  const iconMap: { [key: string]: React.ReactElement } = {
                    'aave': (
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                      </svg>
                    ),
                    'aave_v3': (
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                      </svg>
                    ),
                    'compound': (
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ),
                    'curve': (
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    'yearn': (
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    ),
                    'uniswap': (
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ),
                    'uniswap_v3': (
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )
                  }
                  return iconMap[protocol || ''] || iconMap[strategy || ''] || (
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )
                }

                return strategyHoldings.map((holding: PortfolioHolding, index: number) => (
                  <AutomationIndicator
                    key={`${holding.symbol}-${holding.protocol}-${index}`}
                    position={positions[index % positions.length]}
                    title={`${getProtocolDisplay(holding.protocol || '', holding.strategy)} ${holding.symbol}`}
                    value={formatCurrency(holding.value_usd)}
                    iconColor={getProtocolColor(holding.protocol || '', holding.strategy)}
                    icon={getProtocolIcon(holding.protocol || '', holding.strategy)}
                  />
                ))
              })()}
              */}
            </div>

            {/* Wireframe Overlay within content area */}
            <div className="absolute inset-0 z-10">
              <WireframeOverlay />
            </div>
          </div>
        )}

        {/* Floating Chat Interface - Superimposed - only show when authenticated */}
        {shouldShowMainApp && (
          <div className="pointer-events-none absolute inset-0 z-30">
            <div className="pointer-events-auto">
              <DemaiChatInterface />
            </div>
          </div>
        )}

        {/* Vault Modal - Global overlay */}
        <VaultModal 
          isOpen={isVaultModalOpen} 
          onClose={() => setIsVaultModalOpen(false)} 
        />
      </div>
    </>
  )
}

export default DemaiPage

