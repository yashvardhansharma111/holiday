import FastMarquee from 'react-fast-marquee';

export default function WhyChooseUs() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0">
        <img
          src="/landscape.png"
          alt="Mountain landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <h1 className="text-6xl font-bold text-white mb-8 leading-tight">Why Choose Us</h1>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            Looking for an alpine retreat? Rent a cabin in one of these destinations and swap your worries for
            relaxation, stunning scenery, and fresh mountain air.
          </p>
        </div>

        {/* Horizontal scrolling destination cards with marquee effect */}
        <div className="overflow-hidden pb-4">
          <FastMarquee speed={30} pauseOnHover={true} gradient={false}>
            <div className="flex space-x-6">
              {[
                {
                  name: "Pigeon Forge",
                  subtitle: "Top regions for vacation rentals",
                  image: "/property1.jpg",
                },
                {
                  name: "Broken Bow",
                  subtitle: "Top regions for vacation rentals",
                  image: "/property2.jpg",
                },
                {
                  name: "Yosemite",
                  subtitle: "Top regions for vacation rentals",
                  image: "/property3.jpg",
                },
                {
                  name: "Cloudcroft",
                  subtitle: "Top regions for vacation rentals",
                  image: "/property4.jpg",
                },
              ].map((destination, index) => (
                <div key={index} className="flex-shrink-0 w-80 group cursor-pointer">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 hover:bg-white transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={destination.image}
                          alt={destination.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{destination.name}</h3>
                        <p className="text-gray-600 text-sm">{destination.subtitle}</p>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FastMarquee>
        </div>
      </div>
    </section>
  );
}
