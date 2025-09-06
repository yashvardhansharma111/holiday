// src/components/OverviewBookHolidayRental.tsx
import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Great for Budget",
    text: `Most Holidaymakers have to squeeze their pennies in order to be able to afford their holidays.
      With the cost benefits of Holiday Rentals, more people around the globe are being able to afford the holidays of their dreams.
      No receptionists, no room service, no concierge — translates into less burden on your pocket.`,
  },
  {
    title: "More Room to Unwind",
    text: `Tired of similar looking and cramped hotel rooms? A Holiday rental is the answer.
      From studio rentals to large villas and chalets — unwind and relax without ever experiencing that cramped hotel feeling.`,
  },
  {
    title: "Best Option for Groups & Families",
    text: `Need multiple hotel rooms? Multiply your savings by booking multi-bedroom apartments or villas.
      Enjoy communal spaces, shared meals, and the freedom hotels can’t match.`,
  },
  {
    title: "Unlimited Amenities",
    text: `Holiday rentals can offer an unlimited range of amenities — far beyond what hotels provide.
      Find the rental that suits you best, and be amazed by the options at your disposal.`,
  },
  {
    title: "Pets Welcome",
    text: `Think of your pets as part of the family? Bring them along.
      Many holiday home owners welcome your loved ones with open arms — no more leaving family behind.`,
  },
  {
    title: "Privacy Matters",
    text: `Want a private, discreet holiday? Rent a private home and avoid crowded lobbies and elevators.
      No staff, no strangers — just your getaway, your way.`,
  },
];

const OverviewBookHolidayRental: React.FC = () => {
  return (
    <section className="bg-white py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Overview of <span className="underline decoration-gray-300">BookHolidayRental</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Looking for a perfect vacation? BookHolidayRental is the solution. We serve you with a
            complete online database of vacation rentals worldwide — more than 2 million properties
            across the globe.
          </p>
        </motion.div>

        {/* Why Book With Us */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h3 className="text-2xl md:text-3xl font-semibold mb-4">Why Book With Us?</h3>
          <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Holiday rentals are transforming travel worldwide — delivering unique experiences and
            incredible value compared to hotels. Once you’ve tried a holiday rental, you’ll never go
            back to a hotel. This global trend is here to stay, reshaping the travel industry across
            continents.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-gray-50"
            >
              <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
              <p className="text-gray-600 leading-relaxed">{feature.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Promise / CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <h3 className="text-2xl font-semibold mb-4">Our Promise</h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            We guarantee the best prices, secure payments, and a seamless booking process for every
            guest.
          </p>
          <p className="text-gray-800 font-medium text-lg">
            Trusted by thousands — join happy travelers who found their perfect stay with us.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default OverviewBookHolidayRental;
