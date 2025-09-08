
import FeaturedProperties from "../components/featured-properties"
import WhyChooseUs from "../components/why-choose-us"
import Destinations from "../components/destinations"
import DestinationsShowcase from "../components/destinations-showcase"

import Hero from './Hero';
import Footer from "../components/footer";
import AboutBookHolidayRental from "../components/AboutBookHolidayRental";
import OverviewBookHolidayRental from "../components/OverviewBookHolidayRental";
import WhyUs from "../components/WhyUs";

export default function HomePage() {
  // Simple right-to-left slider for hero images
 
  return (
    <div className="min-h-screen">
      {/* Hero Section - full background slider */}
     <Hero/>
      <FeaturedProperties />
      {/* POpouplar destination */}
      <DestinationsShowcase />
      <WhyChooseUs />
      <WhyUs/>
      <OverviewBookHolidayRental/>
      <Destinations />
      <AboutBookHolidayRental/>
      <Footer />
    </div>
  )
}


// Recommeded Properties Section
// Event Section
// Popular Destination Section
