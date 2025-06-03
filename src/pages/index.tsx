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
import DemaiConnectModal, { DEMAI_AUTH_MESSAGE } from '@/components/DemaiConnectModal'
import DemaiNavbar from '@/components/DemaiNavbar'
import DemaiChatInterface from '@/components/DemaiChatInterface'
import DashboardCard from '@/components/DashboardCard'
import FlowingChart from '@/components/FlowingChart'
import CircularProgress from '@/components/CircularProgress'
import WireframeOverlay from '@/components/WireframeOverlay'
import AutomationIndicator from '@/components/AutomationIndicator'
import { useSurfaceCard } from '@/hooks/useEvents'
import { useOpenWindow } from '@/hooks/useEvents'

// Dummy Card Surfacer Component for testing - Now fully generic
const CardSurfacer: React.FC = () => {
  const openWindow = useOpenWindow()

  // This would normally come from your backend API or context
  // Just demonstrating that it works with any card IDs
  const availableCardIds = [
    'high-yield',
    'compound-eth',
    'curve-3pool',
    'uniswap-v4',
    'portfolio',
    'risk-analysis',
    'alerts',
    'ai-strategy',
    'smart-contract-risk',
    'liquidation-alert',
    // These would be dynamic from backend:
    'staking-rewards',
    'yearn-vault',
    'balancer-pool',
    'convex-crv',
  ]

  const handleOpenWindow = (cardId: string) => {
    console.log(`Opening window via hierarchical event: app.openwindow.${cardId}`)
    openWindow(cardId)
  }

  return (
    <div className="absolute top-4 right-4 z-50 max-w-sm rounded-lg border border-blue-500/30 bg-black/95 p-4 shadow-2xl backdrop-blur-sm">
      <h3 className="mb-2 flex items-center text-sm font-medium text-blue-400">
        <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
        Hierarchical Event System
      </h3>
      <p className="mb-3 text-xs text-gray-400">🚀 Events: app.openwindow.{'{windowId}'} - Works with any card!</p>
      <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
        {availableCardIds.map((cardId) => (
          <button
            key={cardId}
            onClick={() => handleOpenWindow(cardId)}
            className="rounded bg-gradient-to-r from-blue-600 to-blue-700 px-2 py-2 text-xs text-white transition-all duration-200 hover:scale-105 hover:from-blue-500 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/25"
          >
            {cardId
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </button>
        ))}
      </div>
      <div className="mt-3 border-t border-blue-500/20 pt-3 text-xs text-blue-300/70">
        ✨ Hierarchical Events • app.openwindow.{'{id}'} • No infinite loops
      </div>
    </div>
  )
}

// Demo component showing how other parts of the app would surface cards
const OtherAppPartDemo: React.FC = () => {
  const openWindow = useOpenWindow()

  const handleScenarioAction = (cardId: string, scenarioTitle: string) => {
    console.log(`${scenarioTitle} triggered hierarchical event: app.openwindow.${cardId}`)
    openWindow(cardId)
  }

  // Simulate different app sections that might surface cards
  const demoScenarios = [
    {
      title: '🤖 AI Chat Response',
      description: 'When AI mentions a specific yield opportunity',
      cardId: 'high-yield',
      action: 'Surface High Yield Card',
    },
    {
      title: '⚠️ Risk Alert',
      description: 'When system detects high risk condition',
      cardId: 'risk-analysis',
      action: 'Show Risk Analysis',
    },
    {
      title: '💡 AI Recommendation',
      description: 'When AI suggests a strategy',
      cardId: 'ai-strategy',
      action: 'Display Strategy',
    },
    {
      title: '📊 Portfolio Update',
      description: 'When portfolio data changes',
      cardId: 'portfolio',
      action: 'Open Portfolio View',
    },
  ]

  return (
    <div className="absolute bottom-4 left-4 z-50 max-w-xs rounded-lg border border-green-500/30 bg-black/95 p-4 shadow-2xl backdrop-blur-sm">
      <h3 className="mb-2 flex items-center text-sm font-medium text-green-400">
        <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
        App Integration Examples
      </h3>
      <p className="mb-3 text-xs text-gray-400">Examples of how different app parts surface cards</p>
      <div className="space-y-2">
        {demoScenarios.map((scenario, index) => (
          <div key={index} className="rounded-lg border border-slate-700/30 bg-slate-800/50 p-3">
            <div className="mb-1 text-xs font-medium text-slate-200">{scenario.title}</div>
            <div className="mb-2 text-xs text-slate-400">{scenario.description}</div>
            <button
              onClick={() => handleScenarioAction(scenario.cardId, scenario.title)}
              className="rounded bg-gradient-to-r from-green-600 to-green-700 px-2 py-1 text-xs text-white transition-all duration-200 hover:scale-105 hover:from-green-500 hover:to-green-600"
            >
              {scenario.action}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-green-500/20 pt-2 text-xs text-green-300/70">
        🔗 Any component can surface any card using surfaceCard(id)
      </div>
    </div>
  )
}

const DemaiPage = () => {
  const { isConnected, address } = useAccount()
  const [hasValidSignature, setHasValidSignature] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle mounting state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check for existing signature on mount and when address changes
  useEffect(() => {
    if (!mounted || !address) {
      setHasValidSignature(false)
      return
    }

    const storedSignature = localStorage.getItem('demai_auth_signature')
    const storedMessage = localStorage.getItem('demai_auth_message')

    // If we have both signature and message, and they match our expected message
    if (storedSignature && storedMessage === DEMAI_AUTH_MESSAGE) {
      setHasValidSignature(true)
    } else {
      setHasValidSignature(false)
    }
  }, [address, mounted])

  // TODO: Re-enable authentication system
  // Show modal if either not connected or no valid signature
  // const shouldShowModal = !isConnected || !hasValidSignature;
  const shouldShowModal = false // Temporarily disabled for UI development

  // Don't render anything until mounted
  if (!mounted) {
    return null
  }

  return (
    <>
      <DemaiConnectModal
        isOpen={shouldShowModal}
        onSignatureUpdate={(success) => {
          console.log('Signature update:', success) // Debug log
          setHasValidSignature(success)
        }}
      />
      {!shouldShowModal && (
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

          {/* Navbar - Fixed at top */}
          <div className="relative z-10">
            <DemaiNavbar />
          </div>

          {/* Main Content Area */}
          <div className="relative z-10 flex-1 overflow-hidden">
            {/* Dashboard Content as background */}
            <div className="absolute inset-0 overflow-y-auto p-8">
              {/* Portfolio Summary - Upper Left */}
              <div className="absolute top-8 left-12">
                <h1 className="mb-6 text-4xl font-bold text-white">demAI</h1>

                {/* Portfolio Value */}
                <div className="mb-4">
                  <div className="mb-2 text-5xl font-bold text-white">$24,847.32</div>
                  <div className="mb-1 text-lg font-medium text-white/70">Across 3 strategies</div>
                  <div className="flex items-center text-sm font-medium text-green-400">
                    <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +$1,234 (5.2%) today
                  </div>
                </div>

                {/* AI Suggestions */}
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
                      <div className="text-sm text-white/90 italic">"Your ETH position could benefit from rebalancing"</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Action Cards - Lower Left */}
              <div className="absolute bottom-8 left-12 flex space-x-4">
                <div className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-xl bg-purple-600 p-5 transition-colors hover:bg-purple-700">
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

                <div className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-xl bg-cyan-500 p-5 transition-colors hover:bg-cyan-600">
                  <svg className="mb-2 h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-center text-xs font-medium text-white">Find Best Yields</span>
                </div>

                <div className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-xl bg-blue-600 p-5 transition-colors hover:bg-blue-700">
                  <svg className="mb-2 h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span className="text-center text-xs font-medium text-white">Learn DeFi</span>
                </div>
              </div>

              {/* Running Automation Indicators - Scattered like target design */}
              <AutomationIndicator
                position="top-32 left-1/3"
                title="Aave USDC"
                value="$12,450"
                iconColor="bg-blue-500"
                icon={
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                  </svg>
                }
              />

              <AutomationIndicator
                position="top-48 right-1/4"
                title="Compound ETH"
                value="$8,750"
                iconColor="bg-green-500"
                icon={
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              />

              <AutomationIndicator
                position="bottom-1/3 left-1/2"
                title="Curve 3Pool"
                value="$15,200"
                iconColor="bg-purple-500"
                icon={
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />

              <AutomationIndicator
                position="top-1/2 left-2/3"
                title="Yearn Vault"
                value="$6,890"
                iconColor="bg-orange-500"
                icon={
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              />

              <AutomationIndicator
                position="bottom-1/4 right-1/3"
                title="Uniswap V3"
                value="$4,320"
                iconColor="bg-cyan-500"
                icon={
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              />
            </div>

            {/* Wireframe Overlay within content area */}
            <div className="absolute inset-0">
              <WireframeOverlay />
            </div>

            {/* Card Surfacer Test Component */}
            <CardSurfacer />
          </div>

          {/* Floating Chat Interface - Superimposed */}
          <div className="pointer-events-none absolute inset-0 z-30">
            <div className="pointer-events-auto">
              <DemaiChatInterface />
            </div>
          </div>
        </div>
      )}
      <OtherAppPartDemo />
    </>
  )
}

export default DemaiPage
