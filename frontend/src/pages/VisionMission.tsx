import React from "react";
import { motion } from "framer-motion";
import { Eye, Target } from "lucide-react";
import Footer from "../components/footer";

const visions = [
  "We are honest and fair",
  "We honor our commitments",
  "We adhere to ethical and legal standards in all the services offered by us",
  "We respect the uniqueness of the customers or service providers",
];

const VisionMission: React.FC = () => {
  return (
    <>
    <section className="bg-gray-50 py-30 px-6 lg:px-20 min-h-screen flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-16"
      >
        Vision & Mission
      </motion.h2>

      {/* Vision Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-200"
      >
        <div className="flex items-center mb-6 gap-4">
          <div className="bg-gray-100 p-3 rounded-full flex items-center justify-center">
            <Eye className="w-5 h-5 text-gray-700" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">Vision</h3>
        </div>
        <p className="text-gray-700 mb-4">
          Our vision is to work together and make it the best platform for property owners as well as travelers. With high-quality services and round-the-clock support, BookHolidayRentals.com remains committed to its users by staying updated on market knowledge, streamlining processes, defining our skills, and satisfying customers.
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
          {visions.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </motion.div>

      {/* Mission Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
      >
        <div className="flex items-center mb-6 gap-4">
          <div className="bg-gray-100 p-3 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-gray-700" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">Mission</h3>
        </div>
        <p className="text-gray-700 mb-4">
          We conduct business with good faith and integrity in the best interest of the client, providing services confidentially and to the highest standards. We ensure that customers understand our accommodation services clearly.
        </p>
        <p className="text-gray-700">
          We strive to provide excellent services to travelers and accommodation providers by monitoring market and customer needs. Our team assists customers in selecting their ideal stay. At BookHolidayRentals.com, we leave no stone unturned to deliver quality service at competitive prices.
        </p>
      </motion.div>
    </section>
<Footer/>   
 </>
  );
};

export default VisionMission;
