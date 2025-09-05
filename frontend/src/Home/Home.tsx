import SearchForm from "../components/search-form"
import FeaturedProperties from "../components/featured-properties"
import WhyChooseUs from "../components/why-choose-us"
import Destinations from "../components/destinations"
import DestinationsShowcase from "../components/destinations-showcase"
import Footer from "../components/footer"
import Navbar from "../components/Navbar"
import { useEffect, useMemo, useState } from "react"

export default function HomePage() {
  // Simple right-to-left slider for hero images
  const images = useMemo(() => [
    "/property1.jpg",
    "/property2.jpg",
    "/property3.jpg",
  ], [])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <div className="min-h-screen">
      {/* Hero Section - full background slider */}
      <div className="relative overflow-hidden min-h-screen">
        {/* Background slider */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 flex h-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`Hero slide ${i + 1}`}
                className="w-full h-full object-cover flex-shrink-0"
                style={{ width: "100%" }}
              />
            ))}
          </div>
          {/* Overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
        </div>
        {/* Navbar */}
        <div className="relative z-10">
          <Navbar />
        </div>

        {/* Main Content overlayed */}
        <main className="relative z-10 px-6 pt-24 pb-20 flex items-center min-h-[70vh]">
          <div className="max-w-3xl">
            <p className="text-white/90 text-lg mb-4">Find your next escape</p>
            <h1 className="text-white text-5xl md:text-6xl font-extrabold leading-tight mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
              Book beautiful homes, cabins and beach houses
            </h1>
            <p className="text-white/90 text-base md:text-lg mb-10 max-w-2xl">
              Over a million stays across the world. Flexible dates, instant booking, and trusted reviews.
            </p>

            <div className="relative z-20 mt-2 mb-6 max-w-5xl">
              <SearchForm />
            </div>
          </div>
        </main>

        {/* Bottom attribution */}
        <div className="absolute bottom-4 right-4 z-10">
          <span className="text-white/80 text-xs">Born in Berlin 🇩🇪</span>
        </div>
      </div>

      <FeaturedProperties />
      <DestinationsShowcase />
      <WhyChooseUs />
      <Destinations />
      <Footer />
    </div>
  )
}
