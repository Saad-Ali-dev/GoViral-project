"use client"

import { FaCheck, FaXmark } from "react-icons/fa6"

interface Step {
  id: number
  name: string
  status: "pending" | "active" | "success" | "failed"
}

interface StepIndicatorProps {
  steps: Step[]
}

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`
              w-12 h-12 rounded-full border-2 flex items-center justify-center
              text-white font-semibold text-lg
              ${step.status === "active" && "bg-red-600 border-white"}
              ${step.status === "success" && "bg-green-400 border-white"}
              ${step.status === "failed" && "bg-red-600 border-white"}
              ${step.status === "pending" && "bg-[#212121] border-white"}
            `}
          >
            {step.status === "success" && <FaCheck className="text-xl" />}
            {step.status === "failed" && <FaXmark className="text-xl" />}
            {(step.status === "active" || step.status === "pending") && step.id}
          </div>
          {index < steps.length - 1 && (
            <div className="w-16 sm:w-24 h-0.5 bg-white/30 mx-2" />
          )}
        </div>
      ))}
    </div>
  )
}
