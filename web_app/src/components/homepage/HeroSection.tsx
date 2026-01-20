import React from "react"
import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-[#C7161C] rounded-[30px] p-8 md:p-16 flex flex-col items-center justify-center text-center shadow-lg min-h-[300px]">
        {/* Logo Icon Large */}
        <div className="mb-4 relative w-24 h-24 md:w-32 md:h-32">
          <Image
            src="/logo.png"
            alt="GoViral Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="font-poppins font-bold text-4xl md:text-6xl text-white mb-4">
          GoViral
        </h1>

        {/* Subtitle */}
        <p className="font-inter text-white text-lg md:text-2xl flex items-center justify-center gap-2">
          Youtube Shorts SEO Agent
          <span className="text-2xl">🙂</span>
        </p>
      </div>
    </section>
  )
}
