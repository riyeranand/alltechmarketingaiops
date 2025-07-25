import React from 'react'
import { CheckCircle, Circle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Step {
  id: string
  title: string
  description: string
  status: 'pending' | 'active' | 'completed' | 'error'
  icon?: React.ReactNode
}

interface StepProgressProps {
  steps: Step[]
  currentStep?: string
  className?: string
}

export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => {
        const isActive = step.status === 'active'
        const isCompleted = step.status === 'completed'
        const isError = step.status === 'error'
        const isPending = step.status === 'pending'
        
        return (
          <div key={step.id} className="flex items-start space-x-4">
            {/* Step Icon */}
            <div className="flex-shrink-0">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  {
                    "border-blue-500 bg-blue-500 text-white": isActive,
                    "border-green-500 bg-green-500 text-white": isCompleted,
                    "border-red-500 bg-red-500 text-white": isError,
                    "border-gray-300 bg-gray-100 text-gray-400": isPending,
                  }
                )}
              >
                {isActive && <Loader2 className="h-5 w-5 animate-spin" />}
                {isCompleted && <CheckCircle className="h-5 w-5" />}
                {isError && <Circle className="h-5 w-5" />}
                {isPending && <Circle className="h-5 w-5" />}
                {step.icon && !isActive && !isCompleted && !isError && step.icon}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  {
                    "text-blue-600": isActive,
                    "text-green-600": isCompleted,
                    "text-red-600": isError,
                    "text-gray-500": isPending,
                  }
                )}
              >
                {step.title}
              </div>
              <div
                className={cn(
                  "text-xs mt-1 transition-colors duration-300",
                  {
                    "text-blue-500": isActive,
                    "text-green-500": isCompleted,
                    "text-red-500": isError,
                    "text-gray-400": isPending,
                  }
                )}
              >
                {step.description}
              </div>
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-5 top-10 h-8 w-0.5 bg-gray-200" />
            )}
          </div>
        )
      })}
    </div>
  )
}
