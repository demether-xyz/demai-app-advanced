import React, { useState, useRef, useEffect, useCallback } from 'react'
import { sendMessageToDemai } from '../services/demaiApi'
import { useOpenWindow } from '../hooks/useEvents'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSubmittingRef = useRef(false)
  
  // Add openWindow hook for triggering window events
  const openWindow = useOpenWindow()

  // Remove dummy conversation - start with clean chat
  // const dummyConversation: ChatMessage[] = [...]

  // Function to detect and trigger window events from AI responses
  const processWindowEvents = (message: string) => {
    // Define trigger patterns and their corresponding window IDs
    const windowTriggers = [
      { pattern: /show portfolio|portfolio analysis|view portfolio/i, windowId: 'portfolio' },
      { pattern: /high yield|best yield|analyze high yield/i, windowId: 'high-yield' },
      { pattern: /show yearn|yearn vault|yearn analysis/i, windowId: 'yearn-vault' },
      { pattern: /risk analysis|show risks|analyze risks/i, windowId: 'risk-analysis' },
      { pattern: /compound eth|show compound/i, windowId: 'compound-eth' },
      { pattern: /curve pool|show curve|curve 3pool/i, windowId: 'curve-3pool' },
      { pattern: /uniswap|show uniswap|uniswap v4/i, windowId: 'uniswap-v4' },
      { pattern: /ai strategy|show strategy|strategy analysis/i, windowId: 'ai-strategy' },
      { pattern: /smart contract|contract risk/i, windowId: 'smart-contract-risk' },
      { pattern: /liquidation|liquidation alert/i, windowId: 'liquidation-alert' },
      { pattern: /staking rewards|show staking/i, windowId: 'staking-rewards' },
      { pattern: /balancer|show balancer/i, windowId: 'balancer-pool' },
      { pattern: /convex|show convex/i, windowId: 'convex-crv' },
      { pattern: /alerts|show alerts/i, windowId: 'alerts' },
    ]

    // Check for trigger patterns and emit events
    windowTriggers.forEach(({ pattern, windowId }) => {
      if (pattern.test(message)) {
        console.log(`Chat message triggered window event: ${windowId}`)
        openWindow(windowId)
      }
    })
  }

  // Enhanced AI response generator with window event triggers
  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Check for window trigger commands first
    if (lowerMessage.includes('show portfolio') || lowerMessage.includes('portfolio')) {
      openWindow('portfolio')
      return 'Opening your portfolio analysis window...\n\n📊 Your current portfolio:\n• Total Value: $24,847.32\n• Active Strategies: 3\n• 24h Change: +5.2%\n\n🚀 Window Event: portfolio'
    }
    
    if (lowerMessage.includes('high yield') || lowerMessage.includes('best yield')) {
      openWindow('high-yield')
      return 'Analyzing current high yield opportunities...\n\n🎯 Top Opportunities:\n• Yearn USDT: 6.3% APY\n• Curve 3Pool: 5.1% APY\n• Aave USDC: 4.2% APY\n• Compound DAI: 3.8% APY\n\n🚀 Window Event: high-yield'
    }
    
    if (lowerMessage.includes('yearn') || lowerMessage.includes('vault')) {
      openWindow('yearn-vault')
      return 'Opening Yearn Vault detailed analysis...\n\n🏛️ Yearn USDT Vault:\n• Current APY: 6.3%\n• TVL: $2.1B\n• Risk Level: Medium\n• Strategy: Auto-compounding\n\n🚀 Window Event: yearn-vault'
    }
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('analyze risk')) {
      openWindow('risk-analysis')
      return 'Performing comprehensive risk analysis...\n\n⚠️ Portfolio Risk Assessment:\n• Overall Risk: Medium\n• Liquidation Risk: Low\n• Smart Contract Risk: Medium\n• Market Risk: High\n\n🚀 Window Event: risk-analysis'
    }
    
    if (lowerMessage.includes('compound')) {
      openWindow('compound-eth')
      return 'Analyzing Compound ETH position...\n\n🏗️ Compound ETH:\n• Current APY: 3.8%\n• Your Position: $8,750\n• Collateral Ratio: 150%\n• Health Factor: 2.5\n\n🚀 Window Event: compound-eth'
    }
    
    if (lowerMessage.includes('curve')) {
      openWindow('curve-3pool')
      return 'Opening Curve 3Pool analysis...\n\n🌊 Curve 3Pool:\n• Current APY: 5.1%\n• Pool TVL: $1.2B\n• Your LP Position: $15,200\n• Impermanent Loss: Minimal\n\n🚀 Window Event: curve-3pool'
    }
    
    if (lowerMessage.includes('strategy') || lowerMessage.includes('ai strategy')) {
      openWindow('ai-strategy')
      return 'Generating AI-powered yield strategy...\n\n🤖 Recommended Strategy:\n• 40% Stable Yields (Aave/Compound)\n• 35% LP Positions (Curve/Uniswap)\n• 25% High-Risk/High-Reward (Yearn)\n\nExpected APY: 8.2%\n\n🚀 Window Event: ai-strategy'
    }
    
    // Default responses based on keywords
    if (lowerMessage.includes('yield') || lowerMessage.includes('apy')) {
      return 'Current yield opportunities:\n\n🔥 Hot Picks:\n• Yearn USDT Vault: 6.3% APY\n• Curve 3Pool: 5.1% APY\n• Aave USDC: 4.2% APY\n• Compound DAI: 3.8% APY\n\nTry asking "show high yield" to open detailed analysis!'
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! 👋 I\'m demAI, your DeFi yield optimization assistant.\n\n🔧 What I can help with:\n• Portfolio analysis\n• Yield optimization\n• Risk assessment\n• Strategy recommendations\n\n💡 Try commands like:\n• "show portfolio"\n• "analyze high yield"\n• "show risks"\n• "ai strategy"'
    }
    
    // Generic response
    return 'I understand you\'re asking about DeFi strategies. Let me help you optimize your yields!\n\n💡 Available commands:\n• "show portfolio" - View your positions\n• "high yield" - Find best opportunities\n• "analyze risks" - Risk assessment\n• "ai strategy" - Get AI recommendations\n\nEach command will open a detailed analysis window! 🚀'
  }

  // Robust focus management using useCallback for stable reference
  const maintainInputFocus = useCallback(() => {
    if (!inputRef.current || !isExpanded || isLoading) return false
    
    try {
      const activeElement = document.activeElement
      const inputElement = inputRef.current
      
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
  }, [isExpanded, isLoading, shouldMaintainFocus])

  // Focus guard effect - continuously monitors and maintains focus
  useEffect(() => {
    if (!isExpanded || !shouldMaintainFocus) return

    const focusGuard = () => {
      if (maintainInputFocus()) {
        console.debug('Focus restored by guard')
      }
    }

    // Set up focus monitoring
    const focusInterval = setInterval(focusGuard, 100)
    
    // Also listen for focus/blur events on the document
    const handleFocusChange = () => {
      if (shouldMaintainFocus) {
        // Use requestAnimationFrame to ensure this runs after any other focus changes
        requestAnimationFrame(focusGuard)
      }
    }

    document.addEventListener('focusin', handleFocusChange)
    document.addEventListener('focusout', handleFocusChange)

    return () => {
      clearInterval(focusInterval)
      document.removeEventListener('focusin', handleFocusChange)
      document.removeEventListener('focusout', handleFocusChange)
    }
  }, [isExpanded, shouldMaintainFocus, maintainInputFocus])

  // Initialize focus when expanded
  useEffect(() => {
    if (isExpanded) {
      setShouldMaintainFocus(true)
      // Clear any existing timeout
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current)
      }
      // Initial focus with delay to ensure DOM is ready
      focusTimeoutRef.current = setTimeout(() => {
        maintainInputFocus()
      }, 50)
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
  }, [isExpanded, maintainInputFocus])

  // Initialize with dummy conversation when expanded
  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      // Remove dummy conversation initialization
      // setMessages(dummyConversation)
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
      // First check for window event triggers in user message
      processWindowEvents(messageText)
      
      // Try to get response from API first
      const response = await sendMessageToDemai(messageText)
      
      let aiResponseText: string
      
      if (response.success && response.data) {
        aiResponseText = response.data
        // Also check API response for window triggers
        processWindowEvents(aiResponseText)
        console.log('✅ Got API response:', aiResponseText)
      } else {
        console.log('❌ API failed, using fallback:', response.error)
        // Fallback to enhanced local AI responses with window events
        aiResponseText = generateAIResponse(messageText)
      }

      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.log('❌ API error, using fallback:', error)
      // Enhanced error message with suggestion
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Connected to local fallback mode! The API connection had an issue, but I can still help.\n\n💡 Try these commands:\n• "show portfolio"\n• "high yield"\n• "analyze risks"\n\nThese will trigger window events! 🚀',
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
        processWindowEvents(messageText)
        const response = await sendMessageToDemai(messageText)
        
        let aiResponseText: string
        
        if (response.success && response.data) {
          aiResponseText = response.data
          processWindowEvents(aiResponseText)
          console.log('✅ Got API response:', aiResponseText)
        } else {
          console.log('❌ API failed, using fallback:', response.error)
          aiResponseText = generateAIResponse(messageText)
        }

        const aiMessage: ChatMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMessage])
      } catch (error) {
        console.log('❌ API error, using fallback:', error)
        const errorMessage: ChatMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Connected to local fallback mode! The API connection had an issue, but I can still help.\n\n💡 Try these commands:\n• "show portfolio"\n• "high yield"\n• "analyze risks"\n\nThese will trigger window events! 🚀',
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
    }
    // Focus will be handled by the useEffect when isExpanded changes
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
                    <span className="text-sm font-medium text-white/90">demAI</span>
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
            <div className="chat-scrollbar flex-1 space-y-2 overflow-y-auto p-6 font-mono">
              {messages.length === 0 ? (
                /* Terminal-like welcome screen */
                <div className="mt-8 space-y-4 font-mono">
                  <div className="text-sm text-green-400">
                    <div className="mb-2">$ demAI --init</div>
                    <div className="ml-4 text-white/60">Initializing DeFi yield optimization assistant...</div>
                    <div className="ml-4 text-white/60">Loading market data...</div>
                    <div className="ml-4 text-white/60">Ready for queries.</div>
                  </div>
                  <div className="mt-6 text-sm text-white/80">
                    <div className="mb-2 text-blue-400">Available commands:</div>
                    <div className="ml-4 space-y-1 text-white/60">
                      <div>• analyze [token] - Analyze yield opportunities</div>
                      <div>• portfolio - Review your current positions</div>
                      <div>• risks [protocol] - Assess protocol risks</div>
                      <div>• optimize - Get yield optimization suggestions</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Terminal-like chat messages */
                <div className="space-y-1 py-4 font-mono text-sm">
                  {messages.map((message) => (
                    <div key={message.id} className="group">
                      {message.sender === 'user' ? (
                        <div className="flex items-start space-x-2">
                          <span className="flex-shrink-0 text-green-400">user@demAI:~$</span>
                          <div className="flex-1 break-words whitespace-pre-wrap text-white/90">{message.text}</div>
                        </div>
                      ) : (
                        <div className="mt-2 mb-4">
                          <div className="mb-1 flex items-center space-x-2">
                            <span className="flex-shrink-0 text-blue-400">demAI@assistant:</span>
                            <span className="text-xs text-white/40">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="ml-6 leading-relaxed break-words whitespace-pre-wrap text-white/80">{message.text}</div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-blue-400">demAI@assistant:</span>
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
                    // Only prevent automatic focus restoration if user is clicking outside the chat
                    // The focus guard will handle restoration if needed
                    if (!chatContainerRef.current?.contains(e.relatedTarget as Node)) {
                      setShouldMaintainFocus(false)
                    }
                  }}
                  onFocus={() => {
                    // Re-enable focus maintenance when user manually focuses
                    setShouldMaintainFocus(true)
                  }}
                  autoFocus={isExpanded}
                  placeholder={messages.length === 0 ? "Start here optimizing your yield optimization" : ""}
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