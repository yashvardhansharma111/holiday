import React from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import Footer from "../components/footer";

const AboutUs: React.FC = () => {
  return (
     <>
    <section className="relative bg-gray-50 w-full min-h-screen flex items-center justify-center px-6 lg:px-20">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h2 className="text-4xl font-bold text-gray-800">
            About <span className="text-primary">Us</span>
          </h2>
          <p className="text-gray-600 leading-relaxed">
            BookHolidayRental.com introduced a new and unique concept helping
            homeowners and property managers to rent their rental property with
            ease and comfort and also offers the travelers a unique and beautiful
            places to stay of every budget and taste. Our goal is to help our
            homeowners to make enormous rental amount all year and also help
            travelers to find unforgettable and budget accommodation.
          </p>
          <p className="text-gray-600 leading-relaxed">
            BookHolidayRental.com is the most trusted and secure website for
            homeowners to list and very friendly for the renters to book. We are a
            team of young and energetic people having vast experience in online
            marketing of vacation homes who not just help the homeowners to get
            “Bookings” but also assist in designing adverts online & responding to
            inquiries from travelers.
          </p>
          <p className="text-gray-600 leading-relaxed font-medium italic">
            “Right Marketing with Great Bookings” on your vacation rental was
            never so easy. We make it possible for you with no upfront
            investment.
          </p>
          <div className="pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Contact Us
            </h3>
            
            <div className="flex items-center gap-4 text-gray-700 mt-2">
              <Mail className="w-5 h-5 text-primary" />
              <span>info@bookholidayrental.com</span>
            </div>
          </div>
        </motion.div>

        {/* Right Image/Visual */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className=" overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
              alt="Vacation Rentals"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-primary text-white px-6 py-3 rounded-xl shadow-lg font-semibold">
            Trusted by Thousands
          </div>
        </motion.div>
      </div>
   
    </section>
    <Footer/>
   </>
  );
};

export default AboutUs;
