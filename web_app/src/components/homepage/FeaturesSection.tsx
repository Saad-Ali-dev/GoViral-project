import {
  FaMagnifyingGlass,
  FaYoutube,
  FaHourglassHalf,
  FaCloudArrowUp,
} from "react-icons/fa6"

const features = [
  {
    id: 1,
    icon: FaMagnifyingGlass,
    heading: "SEO & Keyword optimization with AI",
    text: "AI Agent analyses your videos and suggests best ranking SEO friendly metadata (such as title, description, tags, keywords e.t.c) according to your content.",
  },
  {
    id: 2,
    icon: FaYoutube,
    heading: "Grow on Youtube",
    text: "Increase your chances of getting viral, by reaching the right audience according to your niche and get more views and subscribers.",
  },
  {
    id: 3,
    icon: FaHourglassHalf,
    heading: "Save Time",
    text: "Save your valuable time by spending less time in keyword research and typing metadata. Give more of your time to create content for your audience.",
  },
  {
    id: 4,
    icon: FaCloudArrowUp,
    heading: "Direct Upload",
    text: "Upload your shorts directly to your Youtube channel after AI review.",
  },
]

export default function FeaturesSection() {
  return (
    <section className="w-full max-w-4xl mx-auto">
      <h2 className="font-poppins font-bold text-4xl text-center mb-10 text-[#212121]">
        Features
      </h2>

      <div className="flex flex-col gap-8">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="bg-[#212121] rounded-[30px] p-8 md:p-10 shadow-lg text-left min-h-56"
          >
            <div className="flex flex-col items-start gap-4">
              <div className="flex justify-center items-center gap-4">
                <div className="text-white">
                  <feature.icon size={40} />
                </div>
                <h3 className="font-poppins font-bold text-xl md:text-2xl text-white">
                  {feature.heading}
                </h3>
              </div>
              <p className="font-inter text-[#B8B8B8] text-base md:text-lg leading-relaxed">
                {feature.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
