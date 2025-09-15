import Navbar from "../components/Navbar"
import { useEffect, useMemo, useState } from "react"
import SearchForm from "../components/search-form"

export default function Hero() {
  // Simple right-to-left slider for hero images
  const images = useMemo(() => [
    "/property1.jpg",
    "/property2.jpg",
    "/property3.jpg",
    "/property5.jpg",
    "/property4.jpg",

  ], [])
  const [index, setIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(id)
  }, [images.length])

  // Preload images for smoother transitions
  useEffect(() => {
    const imagePromises = images.map((src) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = resolve
        img.onerror = resolve
        img.src = src
      })
    })
    
    Promise.all(imagePromises).then(() => {
      setIsLoaded(true)
    })
  }, [images])

  return (
    <div className="min-h-screen">
      {/* Hero Section - full background slider */}
      <div className="relative overflow-hidden min-h-screen">
        {/* Background slider */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 flex h-full transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((src, i) => (
              <div
                key={src}
                className="w-full h-full flex-shrink-0 relative"
                style={{ width: "100%" }}
              >
                <img
                  src={src}
                  alt={`Luxury property ${i + 1}`}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading={i === 0 ? "eager" : "lazy"}
                />
                {/* Subtle vignette effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
              </div>
            ))}
          </div>
          {/* Enhanced overlay for better text contrast and depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
        </div>

        {/* Navbar */}
        <div className="relative z-20">
          <Navbar />
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === index 
                  ? 'bg-white shadow-lg scale-110' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Main Content overlayed */}
        <main className="relative z-10 px-6 lg:px-8 pt-32 pb-24 flex items-center min-h-[75vh]">
          <div className="max-w-4xl mx-auto lg:mx-0">
            {/* Animated entrance effect */}
            <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <p className="text-white/90 text-lg md:text-xl mb-6 font-medium tracking-wide">
                Find your next escape
              </p>
              <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-8 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                Book beautiful homes,{" "}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  cabins and beach houses
                </span>
              </h1>
              <p className="text-white/90 text-lg md:text-xl mb-12 max-w-2xl leading-relaxed">
                Over a million stays across the world. Flexible dates, instant booking, and trusted reviews.
              </p>
            </div>

            {/* Enhanced search form container */}
            <div className={`relative z-30 max-w-5xl transition-all duration-1000 delay-300 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-2 shadow-2xl border border-white/20">
                <SearchForm />
              </div>
            </div>
          </div>
        </main>

       

        {/* Optional: Scroll indicator */}
        <div className="absolute bottom-8 left-8 z-20 hidden md:block">
          <div className="flex flex-col items-center text-white/70">
            <span className="text-sm font-medium mb-2 writing-mode-vertical-rl transform rotate-180">
              Scroll to explore
            </span>
            <div className="w-px h-12 bg-gradient-to-b from-white/70 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}