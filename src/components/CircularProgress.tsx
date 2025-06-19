import React from 'react'

interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
  color?: string
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  className = '',
  color = '#10B981', // Green
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform">
        <defs>
          <filter id="progressGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth={strokeWidth} />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          filter="url(#progressGlow)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-light text-white">
          {percentage}
          <span className="text-lg text-white/60">%</span>
        </span>
      </div>
    </div>
  )
}

export default CircularProgress
