import React, { useState } from "react";
import { motion } from "framer-motion";
import Footer from "../components/footer";

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Property Owner",
    message: "",
    captcha: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // You can handle submission logic here
    alert("Form submitted successfully!");
  };

  return (
    <>
    <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-20 px-6 lg:px-20 min-h-screen flex justify-center items-start">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white shadow-2xl rounded-3xl p-8 lg:p-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1-123-456-7890"
                className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">I am a</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              >
                <option>Property Owner</option>
                <option>Traveler</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message..."
                className="border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition resize-none"
                rows={5}
                required
              ></textarea>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-2xl shadow-lg hover:bg-blue-600 transition"
            >
              Submit
            </motion.button>
          </form>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl p-8 lg:p-12 flex flex-col justify-center shadow-2xl"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h3>
          <p className="text-gray-700 mb-4">
            <span className="font-semibold">Support Email:</span> support@bookholidayrental.com
          </p>
          <p className="text-gray-700 mb-4">
            <span className="font-semibold">General:</span> info@bookholidayrental.com
          </p>
        
          
        </motion.div>
      </div>
    </section>
    <Footer/>
    </>
  );
};

export default ContactUs;
