import React from "react";
import { motion } from "framer-motion";
import { Home, Phone, Calendar, Headphones, Shield, Briefcase } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Home className="w-10 h-10 text-cyan-500" />,
    title: "NETWORK",
    description:
      "Our network covers more than 120 countries and take over 1.5 million clients on vacation every year",
  },
  {
    icon: <Phone className="w-10 h-10 text-cyan-500" />,
    title: "CONTACT",
    description: "Direct contact between Owners and the travelers",
  },
  {
    icon: <Calendar className="w-10 h-10 text-cyan-500" />,
    title: "BOOKING",
    description: "From booking to staying, the whole process is simple and enjoyable",
  },
  {
    icon: <Headphones className="w-10 h-10 text-cyan-500" />,
    title: "EXTENDED SUPPORT",
    description:
      "Any other requirement? We are here to help you with restaurant reservations, guided tours, car rentals and more",
  },
  {
    icon: <Shield className="w-10 h-10 text-cyan-500" />,
    title: "SUPPORT",
    description: "24/7 support for the owners and the travelers",
  },
  {
    icon: <Briefcase className="w-10 h-10 text-cyan-500" />,
    title: "YOUR HOLIDAY STARTS HERE",
    description:
      "With just one click, we connect you with our handpicked properties and you'll find exactly what you are looking for within your budget",
  },
];

const WhyUs: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-20 text-center text-white">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?fit=crop&w=1950&q=80')] bg-cover bg-center opacity-20"></div>
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-7xl mx-auto"
      >
        <h2 className="text-4xl font-extrabold tracking-wider mb-4">WHY US</h2>
        <p className="text-gray-300 max-w-xl mx-auto mb-12">
          Holidayexpertz is a Solution For All Your Vacation Rental Needs
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-8 px-6 md:px-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.05, rotate: [0, 1.5, -1.5, 0] }}
              className="relative bg-white text-gray-900 rounded-2xl shadow-lg overflow-hidden group"
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[40px]"></div>
              <div className="relative p-8 z-10">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex justify-center mb-4"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default WhyUs;
