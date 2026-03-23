import HeroSection from "@/components/homepage/HeroSection"
import UploadSection from "@/components/homepage/UploadSection"
import FeaturesSection from "@/components/homepage/FeaturesSection"

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-inter">
      <main className="flex-grow flex flex-col items-center w-full px-4 py-8 md:py-12">
        <HeroSection />
        <UploadSection />
        <FeaturesSection />
      </main>
    </div>
  )
}
