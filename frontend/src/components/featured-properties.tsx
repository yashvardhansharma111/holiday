export default function FeaturedProperties() {
    const properties = [
      {
        id: 1,
        type: "Cabin",
        guests: 6,
        bedrooms: 3,
        title: "Adorable Mountain A-Frame Tucked in the Pines - Moose Creek Lodge",
        location: "Fairplay, Colorado",
        rating: 4.9,
        reviews: 126,
        image: "/property1.jpg",
      },
      {
        id: 2,
        type: "House",
        guests: 6,
        bedrooms: 3,
        title: "Sea Paradise Cottage",
        location: "Topsail Beach, North Carolina",
        rating: 4.8,
        reviews: 15,
        image: "/property2.jpg",
      },
      {
        id: 3,
        type: "House",
        guests: 8,
        bedrooms: 3,
        title: "Fully equipped house with barbecue | Mountain view",
        location: "Estes Park, Colorado",
        rating: 4.5,
        reviews: 4,
        image: "/property3.jpg",
      },
      {
        id: 4,
        type: "House",
        guests: 6,
        bedrooms: 2,
        title: "Cloudcroft Home w/ Spacious Stargazing Deck!",
        location: "Cloudcroft, New Mexico",
        rating: 4.8,
        reviews: 175,
        image: "/property4.jpg",
      },
    ]
  
    return (
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Our top vacation rentals</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Discover handpicked properties that offer exceptional experiences and unforgettable stays
          </p>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {properties.map((property) => (
              <div key={property.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[4/3]">
                  <img
                    src={property.image || "/placeholder.svg"}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                    {property.type}
                  </div>
                </div>
  
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{property.guests} guests</span>
                    <span>•</span>
                    <span>{property.bedrooms} bedrooms</span>
                  </div>
  
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {property.title}
                  </h3>
  
                  <p className="text-gray-600 text-sm">{property.location}</p>
  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium">{property.rating}</span>
                      <span className="text-sm text-gray-500">({property.reviews})</span>
                    </div>
  
                    <button className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors">
                      View deal
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  