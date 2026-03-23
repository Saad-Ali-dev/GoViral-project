"use client"

import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { FaCloudArrowUp } from "react-icons/fa6"

export default function UploadSection() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

  const handleClick = () => {
    if (isLoaded && isSignedIn) {
      router.push("/upload")
    } else {
      router.push("/sign-in")
    }
  }

  return (
    <section className="w-full max-w-4xl mx-auto mb-16">
      <button
        onClick={handleClick}
        className="w-full bg-[#212121] rounded-[30px] p-12 flex flex-col items-center justify-center text-center shadow-lg border-2 border-white/20 min-h-[250px] hover:border-[#C7161C] transition-colors group cursor-pointer"
        type="button"
        aria-label="Upload video"
      >
        <div className="mb-4 text-white group-hover:text-[#C7161C] transition-colors">
          <FaCloudArrowUp size={80} />
        </div>

        <h2 className="font-poppins font-semibold text-2xl md:text-3xl text-white">
          Upload Short Video
        </h2>
      </button>
    </section>
  )
}
