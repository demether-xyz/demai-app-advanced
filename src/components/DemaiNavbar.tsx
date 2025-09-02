import React from 'react'
import Image from 'next/image'
import { MagnifyingGlassIcon, Cog6ToothIcon, Bars3Icon, UserIcon } from '@heroicons/react/24/outline'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEventEmitter } from '@/hooks/useEvents'

interface DemaiNavbarProps {
  isMobileMenuOpen?: boolean
  setIsMobileMenuOpen?: (open: boolean) => void
}

const DemaiNavbar: React.FC<DemaiNavbarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const emit = useEventEmitter()
  return (
    <nav className="relative flex h-14 items-center justify-between border-b border-gray-800/50 bg-black/95 px-4 lg:px-6 backdrop-blur-md">
      {/* Left Section - Mobile Menu Button + Logo */}
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Button */}
        {setIsMobileMenuOpen && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden rounded-lg p-2 text-white hover:bg-gray-700/50 transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        )}
        
        {/* Logo */}
        <div className="relative h-8 w-24 lg:h-12 lg:w-36">
          <Image src="/images/logo.webp" alt="demAI Logo" fill className="object-contain" priority />
        </div>
      </div>

      {/* Center Section - Search Bar */}
      {/*
      <div className="mx-8 max-w-md flex-1">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Search protocols, strategies, or assets..."
            className="w-full rounded-lg border border-gray-600/60 bg-gray-800/80 py-2.5 pr-4 pl-11 text-sm text-gray-100 placeholder-gray-500 transition-all duration-200 focus:border-blue-500/60 focus:bg-gray-700/80 focus:ring-1 focus:ring-blue-500/40 focus:outline-none"
          />
        </div>
      </div>
      */}

      {/* Right Section - Navigation Tabs and Controls (Hidden on Mobile) */}
      <div className="hidden lg:flex items-center space-x-6">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 rounded-lg bg-gray-800/40 p-1">
          <button className="rounded-md bg-blue-600/80 px-4 py-2 text-sm text-white shadow-sm">Overview</button>
          {/*
          <button className="rounded-md px-4 py-2 text-sm text-gray-400 transition-colors duration-200 hover:text-gray-200">
            Dashboard
          </button>
          */}
          <button 
            onClick={() => emit('vault.open')}
            className="rounded-md px-4 py-2 text-sm text-gray-400 transition-colors duration-200 hover:text-gray-200"
          >
            Vault
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-1">
          {/*
          <button className="rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-gray-700/50 hover:text-gray-200">
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-gray-700/50 hover:text-gray-200">
            <Bars3Icon className="h-5 w-5" />
          </button>
          */}
          {/* Custom styled RainbowKit Connect Button */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              // Note: If your app doesn't use authentication, you
              // can remove all 'authenticationStatus' checks
              const ready = mounted && authenticationStatus !== 'loading'
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === 'authenticated')

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="rounded-md px-4 py-2 text-sm text-gray-400 transition-colors duration-200 hover:text-gray-200"
                        >
                          Connect
                        </button>
                      )
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="rounded-md px-4 py-2 text-sm text-red-400 transition-colors duration-200 hover:text-red-200"
                        >
                          Wrong Network
                        </button>
                      )
                    }

                    return (
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="rounded-md bg-green-600/80 px-4 py-2 text-sm text-white shadow-sm transition-colors duration-200 hover:bg-green-600"
                      >
                        {account.displayName}
                      </button>
                    )
                  })()}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </div>

      {/* Mobile-only Connect Button */}
      <div className="lg:hidden">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== 'loading'
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated')

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="rounded-md px-3 py-1.5 text-xs text-gray-400 transition-colors duration-200 hover:text-gray-200"
                      >
                        Connect
                      </button>
                    )
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="rounded-md px-3 py-1.5 text-xs text-red-400 transition-colors duration-200 hover:text-red-200"
                      >
                        Wrong
                      </button>
                    )
                  }

                  return (
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="rounded-md bg-green-600/80 px-3 py-1.5 text-xs text-white shadow-sm transition-colors duration-200 hover:bg-green-600"
                    >
                      {account.displayName?.split('.')[0] || account.displayName}
                    </button>
                  )
                })()}
              </div>
            )
          }}
        </ConnectButton.Custom>
      </div>
    </nav>
  )
}

export default DemaiNavbar
