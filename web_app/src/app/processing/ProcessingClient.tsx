"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { FaCheck, FaXmark } from "react-icons/fa6"
import { StepIndicator } from "@/components/processing/StepIndicator"

type StepStatus = "pending" | "active" | "success" | "failed"

interface PipelineStep {
  id: number
  name: string
  status: StepStatus
}

const initialSteps: PipelineStep[] = [
  { id: 1, name: "Security Check", status: "active" },
  { id: 2, name: "SEO Generation", status: "pending" },
]

const STEP_DURATION = 5000
const RESULT_DISPLAY_DURATION = 2000

export default function ProcessingClient() {
  const searchParams = useSearchParams()
  const videoId = searchParams.get("video_id")
  const [steps, setSteps] = useState<PipelineStep[]>(initialSteps)
  const [showResult, setShowResult] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const activeStepIndex = steps.findIndex((s) => s.status === "active")
    if (activeStepIndex === -1) return

    const timer = setTimeout(() => {
      setSteps((prev) => {
        const newSteps = [...prev]
        newSteps[activeStepIndex].status = "success"
        return newSteps
      })
      setShowResult(true)

      setTimeout(() => {
        setShowResult(false)
        if (activeStepIndex + 1 < steps.length) {
          setSteps((prev) => {
            const newSteps = [...prev]
            newSteps[activeStepIndex + 1].status = "active"
            return newSteps
          })
        } else {
          setIsComplete(true)
        }
      }, RESULT_DISPLAY_DURATION)
    }, STEP_DURATION)

    return () => clearTimeout(timer)
  }, [steps])

  const activeStep = steps.find((s) => s.status === "active")
  const currentStepStatus = activeStep?.status || steps[steps.length - 1]?.status
  const currentStepName = activeStep?.name || ""

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-5xl mx-auto p-8 bg-[#212121] rounded-[20px]">
          <StepIndicator steps={steps} />
          <div className="flex flex-col items-center mt-8">
            <div className="w-24 h-24 rounded-full bg-green-400 flex items-center justify-center">
              <FaCheck className="text-white text-4xl" />
            </div>
            <p className="text-green-400 mt-4 text-xl font-semibold">
              All Steps Complete
            </p>
            {videoId && (
              <p className="text-white/30 text-xs mt-4">
                Video ID: {videoId.slice(0, 8)}...
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-5xl mx-auto p-8 bg-[#212121] rounded-[20px]">
        <StepIndicator steps={steps} />
        <div className="flex flex-col items-center mt-8">
          {currentStepStatus === "active" && !showResult && (
            <>
              <div className="relative w-64 h-64">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                  poster="/logo.png"
                >
                  <source src="/bot-animation.mp4" type="video/mp4" />
                  <Image
                    src="/logo.png"
                    alt="GoViral"
                    fill
                    className="object-contain"
                  />
                </video>
              </div>
              <p className="text-white/80 text-center mt-4 text-lg">
                Running {currentStepName}, please wait...
              </p>
            </>
          )}

          {showResult && currentStepStatus === "success" && (
            <>
              <div className="w-24 h-24 rounded-full bg-green-400 flex items-center justify-center">
                <FaCheck className="text-white text-4xl" />
              </div>
              <p className="text-green-400 mt-2 font-semibold text-lg">Pass</p>
            </>
          )}

          {currentStepStatus === "failed" && (
            <>
              <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center">
                <FaXmark className="text-white text-4xl" />
              </div>
              <p className="text-red-500 mt-2 font-semibold text-lg">Failed</p>
            </>
          )}

          {videoId && (
            <p className="text-white/30 text-xs mt-8">
              Video ID: {videoId.slice(0, 8)}...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
