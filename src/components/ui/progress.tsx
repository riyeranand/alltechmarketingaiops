import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
    animated?: boolean
    showPercentage?: boolean
  }
>(({ className, value = 0, max = 100, color = 'blue', animated = false, showPercentage = true, ...props }, ref) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500', 
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  }

  return (
    <div className="w-full space-y-2">
      <div
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-gray-200",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            colorClasses[color],
            animated && "animate-pulse"
          )}
          style={{
            width: `${percentage}%`,
          }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
          )}
        </div>
      </div>
      {showPercentage && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>Progress</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  )
})

Progress.displayName = "Progress"

export { Progress }
