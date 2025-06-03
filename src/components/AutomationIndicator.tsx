import React from 'react'

interface AutomationIndicatorProps {
  position: string // Tailwind positioning classes like "top-32 left-1/3"
  title: string
  value: string
  iconColor: string // Tailwind color class like "bg-blue-500"
  icon: React.ReactNode
}

const AutomationIndicator: React.FC<AutomationIndicatorProps> = ({ position, title, value, iconColor, icon }) => {
  return (
    <div
      className={`absolute ${position} flex items-center space-x-2 rounded-lg border border-gray-700/50 bg-black/80 px-3 py-2 shadow-lg`}
    >
      <div className={`h-6 w-6 ${iconColor} flex items-center justify-center rounded`}>{icon}</div>
      <div>
        <div className="text-xs text-gray-300">{title}</div>
        <div className="text-sm font-medium text-white">{value}</div>
      </div>
    </div>
  )
}

export default AutomationIndicator
