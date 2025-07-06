import React, { useState, useRef, useEffect, useCallback } from 'react'
import { sendMessageToDemai } from '../services/demaiApi'
import { useOpenWindow } from '../hooks/useEvents'
import { useAccount, useChainId } from 'wagmi'
import { useVaultAddress } from '../hooks/useVaultAddress'

interface ChatMessage {
  id: number
  sender: 'user' | 'ai' | 'system'
  text: string
  timestamp: Date
}

interface DemaiChatInterfaceProps {
  className?: string
}

const DemaiChatInterface: React.FC<DemaiChatInterfaceProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCollapsing, setIsCollapsing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [shouldMaintainFocus, setShouldMaintainFocus] = useState(false)
  const [isUserSelecting, setIsUserSelecting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSubmittingRef = useRef(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  // Add wallet and chain info for vault address calculation
  const { address } = useAccount()
  const chainId = useChainId()
  const { vaultAddress } = useVaultAddress(address, chainId)
  
  // Add openWindow hook for triggering window events
  const openWindow = useOpenWindow()

  // Add hardcoded window IDs list
  const AVAILABLE_WINDOW_IDS = [
    'high-yield', 'compound-eth', 'curve-3pool', 'uniswap-v4', 'portfolio', 'staking-rewards',
    'yearn-vault', 'balancer-pool', 'convex-crv', 'market-data', 'sushiswap-farm', 'maker-dai',
    'rocket-pool', 'frax-share', 'lido-steth', 'gmx-glp', 'pendle-yield', 'tokemak-reactor',
    'olympus-ohm', 'ribbon-vault', 'risk-analysis', 'alerts', 'ai-strategy', 'smart-contract-risk',
    'liquidation-alert', 'impermanent-loss', 'protocol-governance', 'bridge-security',
    'oracle-manipulation', 'regulatory-risk', 'flash-loan-attack', 'slippage-alert',
    'rug-pull-detector', 'mev-protection', 'whale-movement', 'correlation-risk',
    'gas-optimization', 'depegging-risk', 'validator-risk', 'insurance-coverage'
  ]

  // Robust focus management using useCallback for stable reference
  const maintainInputFocus = useCallback(() => {
    if (!inputRef.current || !isExpanded || isLoading || isUserSelecting) return false
    
    try {
      const activeElement = document.activeElement
      const inputElement = inputRef.current
      
      // Don't steal focus if user is selecting text in messages
      if (messagesContainerRef.current?.contains(activeElement as Node)) {
        return false
      }
      
      // Only focus if not already focused and should maintain focus
      if (activeElement !== inputElement && shouldMaintainFocus) {
        inputElement.focus()
        
        // Set cursor to end of input
        const length = inputElement.value.length
        inputElement.setSelectionRange(length, length)
        return true
      }
      return false
    } catch (error) {
      console.debug('Focus attempt failed:', error)
      return false
    }
  }, [isExpanded, isLoading, shouldMaintainFocus, isUserSelecting])

  // Focus guard effect - much less aggressive, only on specific triggers
  useEffect(() => {
    if (!isExpanded || !shouldMaintainFocus || isUserSelecting) return

    // Only restore focus on very specific triggers, not continuously
    const handleKeyboardActivity = (e: KeyboardEvent) => {
      // Only restore focus if user is pressing typing keys (not selection keys)
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
        if (!isUserSelecting && document.activeElement !== inputRef.current) {
          maintainInputFocus()
        }
      }
    }

    // Only listen for keyboard activity to restore focus
    document.addEventListener('keydown', handleKeyboardActivity)

    return () => {
      document.removeEventListener('keydown', handleKeyboardActivity)
    }
  }, [isExpanded, shouldMaintainFocus, maintainInputFocus, isUserSelecting])

  // Text selection detection effect - comprehensive selection protection
  useEffect(() => {
    if (!isExpanded || !messagesContainerRef.current) return

    const messagesContainer = messagesContainerRef.current
    let selectionTimeout: NodeJS.Timeout | null = null

    const startSelectionMode = () => {
      setIsUserSelecting(true)
      // Clear any existing timeout
      if (selectionTimeout) {
        clearTimeout(selectionTimeout)
      }
    }

    const endSelectionMode = () => {
      // Much longer delay to ensure selection operations are completely finished
      selectionTimeout = setTimeout(() => {
        setIsUserSelecting(false)
      }, 500)
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (messagesContainer.contains(e.target as Node)) {
        startSelectionMode()
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      // If mouse is being dragged over messages, user is likely selecting
      if (e.buttons === 1 && messagesContainer.contains(e.target as Node)) {
        startSelectionMode()
      }
    }

    const handleMouseUp = () => {
      endSelectionMode()
    }

    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) {
        // There's an active text selection
        startSelectionMode()
      } else {
        endSelectionMode()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Selection-related keys
      if (e.key === 'Shift' || e.ctrlKey || e.metaKey || 
          (e.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key))) {
        startSelectionMode()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        endSelectionMode()
      }
    }

    // Listen for various selection-related events
    messagesContainer.addEventListener('mousedown', handleMouseDown)
    messagesContainer.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      if (selectionTimeout) {
        clearTimeout(selectionTimeout)
      }
      messagesContainer.removeEventListener('mousedown', handleMouseDown)
      messagesContainer.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [isExpanded])

  // Initialize focus when expanded - but only enable focus maintenance, don't force focus
  useEffect(() => {
    if (isExpanded) {
      // Enable focus maintenance but don't force focus immediately
      // This allows users to start selecting text right away
      setShouldMaintainFocus(true)
    } else {
      setShouldMaintainFocus(false)
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current)
      }
    }

    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current)
      }
    }
  }, [isExpanded])

  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node) && isExpanded) {
        handleCollapse()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSuggestionClick = (suggestion: ChatMessage) => {
    setInputValue(suggestion.text)
    setTimeout(maintainInputFocus, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    // Set submitting flag to prevent focus interruption
    isSubmittingRef.current = true
    
    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageText = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    // Immediately restore focus after clearing input - don't wait for API response
    isSubmittingRef.current = false
    setShouldMaintainFocus(true)
    
    // Force immediate focus restoration
    requestAnimationFrame(() => {
      maintainInputFocus()
    })

    try {
      // Try to get response from API first
      const response = await sendMessageToDemai(messageText, address, vaultAddress)
      
      let aiResponseText: string
      
      if (response.success && response.data) {
        const aiResponse = response.data
        aiResponseText = aiResponse.text
        
        // Open window if specified in JSON response
        if (aiResponse.windows && Array.isArray(aiResponse.windows)) {
          // First close all currently open windows
          openWindow('close-all')
          
          // Then open new windows with a small delay to ensure close happens first
          const windowsToOpen = aiResponse.windows
          setTimeout(() => {
            windowsToOpen.forEach((windowId: string) => {
              if (AVAILABLE_WINDOW_IDS.includes(windowId)) {
                openWindow(windowId)
              }
            })
          }, 100)
        }
        
      } else {
        aiResponseText = 'Sorry, I\'m having trouble connecting to the AI service right now. Please try again.'
      }

      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Sorry, I\'m having trouble connecting to the AI service right now. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      // Ensure focus is still maintained after response
      if (!shouldMaintainFocus) {
        setShouldMaintainFocus(true)
        requestAnimationFrame(() => {
          maintainInputFocus()
        })
      }
    }
  }

  // Handle message input from chatscope component
  const handleChatScopeSubmit = (innerText: string, textContent: string) => {
    if (!textContent.trim() || isLoading) return

    isSubmittingRef.current = true
    
    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: textContent.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageText = textContent.trim()
    setIsLoading(true)

    // Immediately restore focus after message is sent
    isSubmittingRef.current = false
    setShouldMaintainFocus(true)
    
    requestAnimationFrame(() => {
      maintainInputFocus()
    })

    // Process the message same as before
    setTimeout(async () => {
      try {
        const response = await sendMessageToDemai(messageText, address, vaultAddress)
        
        let aiResponseText: string
        
        if (response.success && response.data) {
          const aiResponse = response.data
          aiResponseText = aiResponse.text
          
          // Open window if specified in JSON response
          if (aiResponse.windows && Array.isArray(aiResponse.windows)) {
            // First close all currently open windows
            openWindow('close-all')
            
            // Then open new windows with a small delay to ensure close happens first
            const windowsToOpen = aiResponse.windows
            setTimeout(() => {
              windowsToOpen.forEach((windowId: string) => {
                if (AVAILABLE_WINDOW_IDS.includes(windowId)) {
                  openWindow(windowId)
                }
              })
            }, 100)
          }
          
        } else {
          aiResponseText = 'Sorry, I\'m having trouble connecting to the AI service right now. Please try again.'
        }

        const aiMessage: ChatMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMessage])
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Sorry, I\'m having trouble connecting to the AI service right now. Please try again.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
        // Ensure focus is still maintained after response
        if (!shouldMaintainFocus) {
          setShouldMaintainFocus(true)
          requestAnimationFrame(() => {
            maintainInputFocus()
          })
        }
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      
      // Don't interrupt if already submitting
      if (isSubmittingRef.current) return
      
      handleSubmit(e)
    }
  }

  const handleCollapse = () => {
    setShouldMaintainFocus(false)
    setIsCollapsing(true)
    
    // Wait for animation to complete before actually collapsing
    setTimeout(() => {
      setIsExpanded(false)
      setIsCollapsing(false)
      setMessages([])
    }, 400) // Match the slide-down animation duration
  }

  const handleInputClick = () => {
    if (!isExpanded) {
      setIsExpanded(true)
      // Only auto-focus when expanding, user clicked the input intentionally
      setTimeout(() => {
        if (inputRef.current && !isUserSelecting) {
          inputRef.current.focus()
        }
      }, 100)
    }
    // If already expanded, user clicked input directly so they want to type
    if (isExpanded && !isUserSelecting) {
      setShouldMaintainFocus(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    // Ensure focus is maintained during typing
    if (!shouldMaintainFocus) {
      setShouldMaintainFocus(true)
    }
  }

  return (
    <div className={`fixed right-6 bottom-6 z-50 transition-all duration-700 ease-out ${className}`} ref={chatContainerRef}>
      {/* Expanded State Content - Slides up from behind the input */}
      {(isExpanded || isCollapsing) && (
        <div className={`absolute right-0 bottom-0 h-[67vh] w-[720px] ${isCollapsing ? 'animate-slide-down' : 'animate-slide-up'}`}>
          {/* Enhanced glow effect with blue theme */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-[#f97316] p-[1px] opacity-80 shadow-lg shadow-blue-500/30 transition-all duration-300">
            <div className="h-full w-full rounded-3xl bg-black/60 backdrop-blur-3xl" />
          </div>

          {/* Additional outer glow */}
          <div className="absolute inset-0 scale-105 rounded-3xl bg-gradient-to-r from-[#2563eb]/20 via-[#60a5fa]/20 to-[#f97316]/20 opacity-60 blur-xl transition-all duration-300" />

          {/* Content container */}
          <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-inner backdrop-blur-3xl">
            {/* Header with improved design */}
            <div className="relative border-b border-white/5 p-4">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb]/5 via-transparent to-[#60a5fa]/5" />

              <div className="relative flex items-center justify-between">
                {/* Left side - Status indicator with enhanced design */}
                <div className="flex items-center space-x-3">
                  {/* Multi-layered status indicator */}
                  <div className="relative">
                    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-gradient-to-r from-[#2563eb] to-[#60a5fa] shadow-lg shadow-blue-400/50" />
                    <div className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full bg-gradient-to-r from-[#2563eb]/30 to-[#60a5fa]/30" />
                  </div>

                  {/* Status text */}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white/90">demai</span>
                    <span className="font-mono text-xs text-green-400">● online</span>
                  </div>
                </div>

                {/* Right side - Enhanced close button */}
                <div className="flex items-center space-x-2">
                  {/* Minimize button */}
                  <button
                    onClick={handleCollapse}
                    className="group relative rounded-full border border-white/10 bg-white/5 p-1.5 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#2563eb]/20 to-[#60a5fa]/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    <svg
                      className="relative h-3.5 w-3.5 text-white/60 transition-colors duration-200 group-hover:text-white/90"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div ref={messagesContainerRef} className="chat-scrollbar flex-1 space-y-2 overflow-y-auto px-6 pb-6 font-mono">
              {messages.length === 0 ? (
                /* Terminal-like welcome screen */
                <div className="mt-4 space-y-4 font-mono">
                  <div className="text-sm text-green-400">
                    <div className="mb-2 select-none">$ demai --init</div>
                    <div className="ml-4 text-white/60 select-text">Initializing DeFi yield optimization assistant...</div>
                    <div className="ml-4 text-white/60 select-text">Loading market data...</div>
                    <div className="ml-4 text-white/60 select-text">Ready for queries.</div>
                  </div>
                  <div className="mt-6 text-sm text-white/80">
                    <div className="mb-2 text-blue-400 select-none">Available commands:</div>
                    <div className="ml-4 space-y-1 text-white/60">
                      <div className="select-text">• analyze [token] - Analyze yield opportunities</div>
                      <div className="select-text">• portfolio - Review your current positions</div>
                      <div className="select-text">• risks [protocol] - Assess protocol risks</div>
                      <div className="select-text">• optimize - Get yield optimization suggestions</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Terminal-like chat messages */
                <div className="space-y-1 pt-4 font-mono text-sm">
                  {messages.map((message) => (
                    <div key={message.id} className="group">
                      {message.sender === 'user' ? (
                        <div className="flex items-start space-x-2">
                          <span className="flex-shrink-0 text-green-400 select-none">user@demai:~$</span>
                          <div className="flex-1 break-words whitespace-pre-wrap text-white/90 select-text">{message.text}</div>
                        </div>
                      ) : (
                        <div className="mt-2 mb-4">
                          <div className="mb-1 flex items-center space-x-2">
                            <span className="flex-shrink-0 text-blue-400 select-none">demai@assistant:</span>
                            <span className="text-xs text-white/40 select-none">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="ml-6 leading-relaxed break-words whitespace-pre-wrap text-white/80 select-text">{message.text}</div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-blue-400">demai@assistant:</span>
                      <div className="flex items-center space-x-1">
                        <div className="h-1 w-1 animate-bounce rounded-full bg-white/60" />
                        <div className="h-1 w-1 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '0.1s' }} />
                        <div className="h-1 w-1 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-xs text-white/60">processing...</span>
                    </div>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Spacer to account for fixed input bar */}
            <div className="h-20" />
          </div>
        </div>
      )}

      {/* Fixed Input Bar - Always Visible */}
      <div className="relative z-20">
        <div className="relative w-[720px]">
          {/* Enhanced glow effect with blue theme */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-[#f97316] p-[1px] opacity-80 shadow-lg shadow-blue-500/30 transition-all duration-300">
            <div className="h-full w-full rounded-full bg-black/60 backdrop-blur-3xl" />
          </div>

          {/* Additional outer glow */}
          <div className="absolute inset-0 scale-110 rounded-full bg-gradient-to-r from-[#2563eb]/20 via-[#60a5fa]/20 to-[#f97316]/20 opacity-60 blur-xl transition-all duration-300" />

          {/* Content */}
          <div className="relative rounded-full border border-white/10 bg-black/40 px-6 py-3 shadow-inner backdrop-blur-3xl">
            <form onSubmit={handleSubmit} className="flex items-center justify-between">
              <div className="flex flex-1 items-center space-x-3">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-gradient-to-r from-[#2563eb] to-[#60a5fa] shadow-lg shadow-blue-400/50" />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onClick={handleInputClick}
                  onBlur={(e) => {
                    // Disable focus maintenance when user tabs away or clicks outside chat
                    if (!chatContainerRef.current?.contains(e.relatedTarget as Node)) {
                      setShouldMaintainFocus(false)
                    }
                  }}
                  onFocus={() => {
                    // Re-enable focus maintenance when user manually focuses the input
                    if (!isUserSelecting) {
                      setShouldMaintainFocus(true)
                    }
                  }}
                  autoFocus={isExpanded}
                  placeholder={messages.length === 0 ? "start here optimizing your yield" : ""}
                  className="siri-glow-subtle flex-1 bg-transparent text-base font-medium text-white placeholder-white/50 focus:outline-none"
                  disabled={isLoading}
                />
              </div>
              {/* Send button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                onMouseDown={(e) => {
                  // Prevent button click from stealing focus
                  e.preventDefault()
                }}
                onClick={(e) => {
                  e.preventDefault()
                  handleSubmit(e)
                }}
                className="flex items-center justify-center rounded-full border border-white/20 bg-gradient-to-r from-[#2563eb]/90 to-[#60a5fa]/90 p-1.5 text-white shadow-lg shadow-blue-500/40 backdrop-blur-xl transition-all duration-200 hover:from-[#2563eb] hover:to-[#60a5fa] hover:shadow-blue-500/60 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemaiChatInterface