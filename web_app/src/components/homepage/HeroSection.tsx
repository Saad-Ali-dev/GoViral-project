import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="w-full max-w-4xl mx-auto mb-4">
      <div className="bg-[#C7161C] rounded-[30px] p-8 md:p-16 flex flex-col items-center justify-center text-center shadow-lg min-h-[250px] sm:min-h-[270px]">
        <div className="flex justify-center items-center">
          {/* Logo Icon Large */}
          <div className="relative top-1 -left-6 w-24 h-24 small-logo sm:w-28 sm:h-28 md:w-32 md:h-32 2xl:w-44 2xl:h-44">
            <Image
              src="/logo.png"
              alt="GoViral Logo"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Title */}
          <h1 className="relative -left-10 top-1 sm:top-0 font-poppins font-semibold ftsize-small text-4xl sm:text-6xl 2xl:text-7xl text-white mb-4">
            GoViral
          </h1>
        </div>

        {/* Subtitle */}
        <p className="font-inter text-white text-lg md:text-2xl flex items-center justify-center gap-2">
          AI-Powered Short-Form SEO Agent
          {/* <span className="text-2xl">🙂</span> */}
          <span>
            <Image
              src="/smiley-small.png"
              alt="Smiley Icon"
              width={30}
              height={30}
              className="inline-block"
            />
          </span>
        </p>
      </div>
    </section>
  )
}
