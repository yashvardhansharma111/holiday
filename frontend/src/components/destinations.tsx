import FastMarquee from 'react-fast-marquee';

export default function Destinations() {
  return (
    <section className="py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 text-balance">
            Best spots for waterfront homes and lakehouses
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl leading-relaxed">
            Are you dreaming about vacationing in paradise? Pack your swimsuit and sunscreen and escape to one of these
            top beach destinations. Browse beautiful beach houses and vacation rentals that are just a short walk from
            the water.
          </p>
        </div>

        {/* Horizontal scrolling destination cards with marquee effect */}
        <div className="overflow-hidden pb-6">
          <FastMarquee speed={30} pauseOnHover={true} gradient={false}>
            <div className="flex space-x-8">
              {[
                {
                  name: "Panama City Beach",
                  subtitle: "Top regions for vacation rentals",
                  image: "/property1.jpg",
                },
                {
                  name: "Tybee Island",
                  subtitle: "Top regions for vacation rentals",
                  image: "/property2.jpg",
                },
                {
                  name: "Orange Beach",
                  subtitle: "Top regions for vacation rentals",
                  image: "/property3.jpg",
                },
                { name: "Gulf Shores", subtitle: "Top regions for vacation rentals", image: "/property4.jpg" },
                {
                  name: "Myrtle Beach",
                  subtitle: "Top regions for vacation rentals",
                  image: "/property5.jpg",
                },
              ].map((destination, index) => (
                <div key={index} className="flex-shrink-0 w-80 group cursor-pointer">
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:-translate-y-2">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden">
                            <img
                              src={destination.image}
                              alt={destination.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{destination.name}</h3>
                            <p className="text-gray-600 text-sm">{destination.subtitle}</p>
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
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
