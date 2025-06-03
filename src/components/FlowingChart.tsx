import React from 'react'

interface FlowingChartProps {
  className?: string
  height?: number
  primaryColor?: string
  secondaryColor?: string
}

const FlowingChart: React.FC<FlowingChartProps> = ({
  className = '',
  height = 120,
  primaryColor = '#8B5CF6', // Purple
  secondaryColor = '#F97316', // Orange
}) => {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none" className="overflow-visible">
        <defs>
          {/* Gradient definitions */}
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.4" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Purple flowing line */}
        <path
          d="M0,80 Q50,40 100,50 T200,45 T300,55 T400,65"
          fill="none"
          stroke="url(#purpleGradient)"
          strokeWidth="4"
          filter="url(#glow)"
          className="animate-pulse"
          style={{
            animationDuration: '3s',
            animationTimingFunction: 'ease-in-out',
          }}
        />

        {/* Orange flowing line */}
        <path
          d="M0,90 Q60,30 120,35 T240,40 T360,50 T400,45"
          fill="none"
          stroke="url(#orangeGradient)"
          strokeWidth="4"
          filter="url(#glow)"
          className="animate-pulse"
          style={{
            animationDuration: '2.5s',
            animationTimingFunction: 'ease-in-out',
            animationDelay: '0.5s',
          }}
        />

        {/* Additional subtle flowing line */}
        <path
          d="M0,70 Q80,50 160,55 T320,60 T400,70"
          fill="none"
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="2"
          filter="url(#glow)"
          className="animate-pulse"
          style={{
            animationDuration: '4s',
            animationTimingFunction: 'ease-in-out',
            animationDelay: '1s',
          }}
        />
      </svg>
    </div>
  )
}

export default FlowingChart
