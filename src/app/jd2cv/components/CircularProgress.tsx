interface CircularProgressProps {
  value: number
  target: number
  size?: number
  strokeWidth?: number
  className?: string
}

export default function CircularProgress({ 
  value, 
  target, 
  size = 40, 
  strokeWidth = 3,
  className = ""
}: CircularProgressProps) {
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgb(229 231 235)" // gray-200
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgb(139 92 246)" // purple-500
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
          strokeLinecap="round"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-700">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}