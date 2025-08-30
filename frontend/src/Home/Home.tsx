import SearchForm from "../components/search-form"
import FeaturedProperties from "../components/featured-properties"
import WhyChooseUs from "../components/why-choose-us"
import Destinations from "../components/destinations"
import Footer from "../components/footer"
import Navbar from "../components/Navbar"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-400">
        {/* Navbar */}
        <div className="relative z-10">
          <Navbar />
        </div>

        {/* Main Content */}
        <main className="relative z-10 px-6 pt-8 pb-20">
          <div className="max-w-2xl">
            <p className="text-white/90 text-base mb-6">The world's largest selection of vacation rentals</p>
            <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-16">
              Millions of stays.
              <br />
              One home.
            </h1>
          </div>

          <div className="relative z-20 mt-8 mb-16 flex justify-center">
            <SearchForm />
          </div>
        </main>

        <div className="absolute inset-y-28 right-0 w-[48vw] md:w-[42vw] pointer-events-none">
          <div className="relative h-full">
            <img
              src="/home.png"
              alt="Luxury vacation rental with circular architecture and pool"
              className="w-full h-full object-cover rounded-l-[3rem] shadow-2xl"
            />
          </div>
        </div>

        {/* Bottom attribution */}
        <div className="absolute bottom-4 right-4 z-10">
          <span className="text-white/70 text-xs">Born in Berlin 🇩🇪</span>
        </div>
      </div>

      <FeaturedProperties />
      <WhyChooseUs />
      <Destinations />
      <Footer />
    </div>
  )
}
