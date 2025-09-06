import React from "react";
import { motion } from "framer-motion";
import { Home, Users, Gift, Heart, ShieldCheck } from "lucide-react";
import Footer from "../components/footer";

const advertisePoints = [
  {
    title: "Great for Budget",
    icon: <Gift className="w-6 h-6 text-gray-700" />,
    description: `Most holidaymakers want to squeeze their pennies. Holiday rentals save costs—no receptionists, room service, or expensive restaurants. Fully equipped kitchens help you cook your meals and save extra bucks.`,
  },
  {
    title: "More Room to Unwind",
    icon: <Home className="w-6 h-6 text-gray-700" />,
    description: `Escape cramped hotel rooms! Choose from studios, apartments, villas, mansions, or chalets. Relax freely in a space designed for comfort and privacy.`,
  },
  {
    title: "Best for Large Groups & Families",
    icon: <Users className="w-6 h-6 text-gray-700" />,
    description: `Booking multiple hotel rooms is expensive. Holiday homes offer multi-bedroom options, shared communal spaces, and the freedom to cook and celebrate together.`,
  },
  {
    title: "Unlimited Amenities",
    icon: <ShieldCheck className="w-6 h-6 text-gray-700" />,
    description: `Private rentals can offer a wide variety of amenities that hotels can't compete with. Just choose the rental that suits your lifestyle.`,
  },
  {
    title: "Pets Welcome",
    icon: <Heart className="w-6 h-6 text-gray-700" />,
    description: `Bring your furry friends along! Many holiday home owners welcome pets, unlike most hotels.`,
  },
  {
    title: "Privacy",
    icon: <ShieldCheck className="w-6 h-6 text-gray-700" />,
    description: `Rent a private home for a discreet, private holiday. Avoid crowded lobbies and elevators and enjoy complete peace.`,
  },
];

const AdvertiseWithUs: React.FC = () => {
  return (
    <>
    <section className="bg-gray-50 py-30 px-6 lg:px-20 min-h-screen flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-4xl lg:text-5xl font-extrabold text-center text-gray-900 mb-12"
      >
        Advertise With Us
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-3xl text-center text-gray-700 text-base lg:text-lg mb-12"
      >
        Holiday Rentals have revolutionized travel. Travelers worldwide prefer private homes for the unique experience, cost benefits, and flexibility. Here’s why advertising with us is a great idea:
      </motion.p>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {advertisePoints.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-xl hover:scale-[1.03] transform transition-transform border border-gray-200 flex flex-col items-start gap-4"
          >
            <div className="bg-gray-100 p-3 rounded-full flex items-center justify-center">
              {item.icon}
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold text-gray-900">{item.title}</h3>
            <p className="text-gray-600 text-sm lg:text-base leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
    <Footer/>
  </>
  );
};

export default AdvertiseWithUs;
