import Navbar from "../components/layout/Navbar"
import HeroSection from "../components/homepage/HeroSection"
import UploadSection from "../components/homepage/UploadSection"
import FeaturesSection from "../components/homepage/FeaturesSection"
import Footer from "../components/layout/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-inter">
      <Navbar />

      <main className="flex-grow flex flex-col items-center w-full px-4 py-8 md:py-12">
        <HeroSection />
        <UploadSection />
        <FeaturesSection />
      </main>

      <Footer />
    </div>
  )
}
