// src/components/AboutBookHolidayRental.tsx
import React from "react";

const AboutBookHolidayRental: React.FC = () => {
  return (
    <section className="bg-gray-50 py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto text-gray-800">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Discover what <span className="underline decoration-gray-400">BookHolidayRental</span> is all about
          </h2>
          <div className="mt-4 h-1 w-24 mx-auto bg-gray-300 rounded-full"></div>
        </div>

        {/* Intro */}
        <p className="text-lg md:text-xl leading-relaxed mb-8 text-center">
          With over <strong>2 million bookable vacation rentals</strong>, BookHolidayRental connects
          homeowners with families and vacationers looking for something more than a hotel for
          their trip.
        </p>

        <div className="space-y-6">
          <p className="leading-relaxed">
            The BookHolidayRental community offers families an array of rental property types such
            as <strong>condos, cabins, lake rentals, beach houses</strong>, and more. Discover
            properties in destinations that everyone dreams of visiting. All it takes is a quick
            BookHolidayRental property search to securely book your next condo, cabin, or house
            anywhere in the world.
          </p>
          <p className="leading-relaxed">
            If you're traveling with a large group, you can find rental homes on BookHolidayRental
            that give you the space and comfort you need without sacrificing the amenities that
            matter most, all within your budget. And with BookHolidayRental, pricing is upfront —
            no hidden fees, no surprises. That means more transparency, less stress, and more time
            to focus on planning the perfect getaway.
          </p>
        </div>

        {/* Subheading */}
        <div className="mt-12">
          <h3 className="text-3xl font-bold mb-4">
            Here’s what makes a vacation rental perfect for you
          </h3>
          <div className="space-y-6">
            <p className="leading-relaxed">
              Whether you're planning a <strong>family vacation with your pet</strong>, a relaxing
              weekend getaway, or an adventurous excursion, vacation rentals are ideal for trips of
              all types. You can find everything from charming mountain cabins and lakeside lodges
              to breathtaking city apartments and luxury homes — all with an array of features to
              make your trip more comfortable and convenient.
            </p>
            <p className="leading-relaxed">
              Staying in a vacation home means enjoying amenities like extra bedrooms or a full
              kitchen with appliances, making it much easier to enjoy a stress-free trip with the
              family. You can also find vacation home rentals with additional features such as
              waterfront views, a private pool or hot tub, or outdoor entertainment space.
            </p>
            <p className="leading-relaxed">
              On BookHolidayRental, you can find offers and discounts on weekly and monthly rentals,
              making longer stays more affordable. Additionally, newly listed homes often feature
              special introductory rates, allowing you to enjoy unique accommodations at a great
              price.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutBookHolidayRental;
