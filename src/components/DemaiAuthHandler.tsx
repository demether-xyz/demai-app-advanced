import React, { useCallback, useEffect, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Image from 'next/image'

export const DEMAI_AUTH_MESSAGE = `Welcome to demAI!

This signature will be used to authenticate your interactions with the demAI platform.

This signature will not trigger any blockchain transactions or grant any token approvals.`

interface StoredAuthData {
  signature: string
  message: string
  address: string
}

interface DemaiAuthHandlerProps {
  onSignatureUpdate: (success: boolean) => void
}

const DemaiAuthHandler: React.FC<DemaiAuthHandlerProps> = ({ onSignatureUpdate }) => {
  const { isConnected, address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSigningMessage, setIsSigningMessage] = useState(false)

  // Handle mounting state
  useEffect(() => {
    setMounted(true)
  }, [])

  const formatAddress = useCallback((addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }, [])

  const getStoredAuthData = useCallback((): StoredAuthData | null => {
    const storedData = localStorage.getItem('demai_auth_data')
    if (!storedData) return null

    try {
      return JSON.parse(storedData)
    } catch {
      return null
    }
  }, [])

  const hasValidSignatureForAddress = useCallback(
    (currentAddress: string): boolean => {
      const authData = getStoredAuthData()
      return !!(
        authData &&
        authData.signature &&
        authData.message === DEMAI_AUTH_MESSAGE &&
        authData.address.toLowerCase() === currentAddress.toLowerCase()
      )
    },
    [getStoredAuthData]
  )

  // Check for existing signature when component mounts or address changes
  useEffect(() => {
    if (!mounted) return

    const checkSignature = async () => {
      if (address && isConnected) {
        const isValid = hasValidSignatureForAddress(address)
        onSignatureUpdate(isValid)
      } else {
        onSignatureUpdate(false)
      }
    }

    checkSignature()
  }, [address, isConnected, mounted, onSignatureUpdate, hasValidSignatureForAddress])

  const handleSignMessage = useCallback(async () => {
    if (!address || !isConnected) {
      setError('Wallet not connected. Please connect your wallet first.')
      return
    }

    setError(null)
    setIsSigningMessage(true)

    try {
      const signature = await signMessageAsync({
        message: DEMAI_AUTH_MESSAGE,
      })

      // Store auth data with address
      const authData: StoredAuthData = {
        signature,
        message: DEMAI_AUTH_MESSAGE,
        address,
      }
      localStorage.setItem('demai_auth_data', JSON.stringify(authData))
      onSignatureUpdate(true)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('rejected')) {
          setError('You need to sign the message to access demAI. Please try again.')
        } else {
          setError('Failed to sign message. Please try again.')
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
      onSignatureUpdate(false)
    } finally {
      setIsSigningMessage(false)
    }
  }, [address, isConnected, signMessageAsync, onSignatureUpdate])

  // Don't render anything until mounted
  if (!mounted) return null

  // If wallet is connected, check if user has valid signature
  if (isConnected && address) {
    const hasValidSignature = hasValidSignatureForAddress(address)
    // Don't show anything if user already has valid signature
    if (hasValidSignature) return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

      {/* Floating particles effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 animate-pulse rounded-full bg-cyan-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-gray-900/95 to-black/95 p-8 shadow-2xl backdrop-blur-xl">
        {/* Glowing border effect */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-cyan-400/20 blur-sm" />

        <div className="relative flex flex-col items-center text-center">
          {/* Logo with enhanced glow */}
          <div className="group relative mb-6 h-32 w-32 rounded-full border border-cyan-500/30 bg-gradient-to-br from-black to-gray-900 p-4">
            {/* Multiple glow layers */}
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl transition-all duration-500 group-hover:bg-cyan-400/30" />
            <div className="absolute inset-2 rounded-full bg-cyan-400/10 blur-lg transition-all duration-500 group-hover:bg-cyan-400/20" />
            <Image
              src="/images/logo.webp"
              alt="demAI Logo"
              fill
              className="relative z-10 object-contain p-2 drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]"
              priority
            />
          </div>

          <div className="mb-6 text-3xl font-bold">
            <span className="text-white">Welcome to </span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
              demAI
            </span>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 backdrop-blur-sm">
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}

          <p className="mb-8 text-lg leading-relaxed text-gray-300">
            {!isConnected 
              ? 'Connect your wallet to access the demAI platform.'
              : 'Please sign the message to access the demAI platform.'
            }
          </p>

          <div className="w-full space-y-6">
            {isConnected && address ? (
              <>
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 backdrop-blur-sm">
                  <p className="font-medium text-green-400">✓ Wallet Connected</p>
                  <p className="mt-1 text-sm text-gray-300">{formatAddress(address)}</p>
                </div>

                <button
                  onClick={handleSignMessage}
                  disabled={isSigningMessage}
                  className="group relative w-full overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 transition-all duration-300 hover:border-purple-400/50 hover:from-purple-500/30 hover:to-pink-500/30"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

                  <span className="relative z-10 font-medium tracking-wide text-white">
                    {isSigningMessage ? 'Signing...' : 'Sign Message to Continue'}
                  </span>

                  {/* Animated border */}
                  <div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-purple-400/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ padding: '1px' }}
                  >
                    <div className="h-full w-full rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20" />
                  </div>
                </button>
              </>
            ) : (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 backdrop-blur-sm">
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button 
                      onClick={openConnectModal}
                      className="group relative w-full overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 transition-all duration-300 hover:border-blue-400/50 hover:from-blue-500/30 hover:to-cyan-500/30"
                    >
                      {/* Button glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                      
                      <span className="relative z-10 font-medium tracking-wide text-white">
                        Connect Wallet
                      </span>

                      {/* Animated border */}
                      <div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/30 via-cyan-400/30 to-blue-400/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ padding: '1px' }}
                      >
                        <div className="h-full w-full rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20" />
                      </div>
                    </button>
                  )}
                </ConnectButton.Custom>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemaiAuthHandler 