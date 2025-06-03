import React, { useState, useRef, useEffect } from 'react'
import { sendMessageToDemai } from '../services/demaiApi'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Dummy conversation about yield optimization
  const dummyConversation: ChatMessage[] = [
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm your DeFi yield optimization assistant. I can help you analyze your portfolio and find the best yield farming opportunities.",
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
    },
    {
      id: 2,
      sender: 'user',
      text: "What's the current best yield for stablecoins?",
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
    },
    {
      id: 3,
      sender: 'ai',
      text: 'Currently, the top stablecoin yields are:\n\n• Aave USDC: 4.2% APY\n• Compound DAI: 3.8% APY\n• Curve 3Pool: 5.1% APY\n• Yearn USDT Vault: 6.3% APY\n\nYearn USDT Vault offers the highest yield but comes with smart contract risk. Would you like me to analyze the risk/reward ratio?',
      timestamp: new Date(Date.now() - 180000), // 3 minutes ago
    },
    {
      id: 4,
      sender: 'user',
      text: 'Yes, please analyze the Yearn vault risks',
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
    },
    {
      id: 5,
      sender: 'ai',
      text: 'Yearn USDT Vault Analysis:\n\n🔒 SECURITY:\n• Audited by Trail of Bits & ConsenSys\n• $2.1B TVL indicates strong trust\n• 2+ years operational history\n\n⚠️ RISKS:\n• Smart contract risk (medium)\n• Impermanent loss potential\n• Strategy complexity risk\n\n📊 RECOMMENDATION:\n• Suitable for 10-30% of stablecoin allocation\n• Consider diversifying across multiple protocols\n• Monitor vault strategy changes\n\nWould you like me to suggest a diversified yield strategy?',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
    },
  ]

  // Initialize with dummy conversation when expanded
  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      setMessages(dummyConversation)
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

  const handleSuggestionClick = (suggestion: (typeof dummyConversation)[0]) => {
    setInputValue(suggestion.text)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await sendMessageToDemai(userMessage.text)

      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.success ? response.data || 'No response received' : `Error: ${response.error}`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleCollapse = () => {
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
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onClick={handleInputClick}
                  placeholder="Start here optimizing your yield optimization"
                  className="siri-glow-subtle flex-1 bg-transparent text-base font-medium text-white placeholder-white/50 focus:outline-none"
                  disabled={isLoading}
                />
              </div>
              {/* Send button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
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
