import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Info } from "lucide-react";
import Footer from "../components/footer";

const privacySections = [
  {
    title: "Introduction",
    content: `Your personal information is vital for us as we value your trust. BookHolidayRentals.com adopts concern and caution in safeguarding the privacy of our users. This privacy policy defines how your personal information is used and saved, applicable to BookHolidayRentals.com, associated websites, and mobile applications.`,
  },
  {
    title: "Collection of Data",
    content: `Users sharing properties or making inquiries must provide details such as name, billing address, email, and payment info. We also collect data like location (GPS/IP), browsing activity, and interactions with social media platforms for better user experience. Cookies help maintain sessions and preferences.`,
  },
  {
    title: "Using Personal Data",
    content: `Collected data is used to complete reservations, communicate offers, provide customer support, send newsletters (if opted-in), customize experience, and enforce terms. Data is shared with property owners/managers and authorized third parties only for specific business purposes.`,
  },
  {
    title: "Sharing of Data",
    content: `Information may be shared for legal obligations, corporate transactions, updates, or to prevent unlawful activities. Third-party services like payment processors and analytics are authorized to access data solely to perform their functions.`,
  },
  {
    title: "Social Media Integration",
    content: `Social media plugins may share your basic information (email, friends list) if you log in via social accounts. This helps create a personalized experience on our website.`,
  },
  {
    title: "Mobile Application",
    content: `Our mobile apps allow users to access their accounts and preferences, use location services, and receive updates on nearby accommodations with consent. Privacy rules are similar to the website.`,
  },
  {
    title: "Data Safety & Cookies",
    content: `We ensure your data is secure with authorized third-party access only. Cookies maintain session details, preferences, and selections. Users can control cookie settings via browser, but disabling some cookies may limit functionality. Cookies have a lifespan of up to five years.`,
  },
  {
    title: "User Rights",
    content: `You can manage the personal data shared with us by contacting customer support with identification verification. Ensure your details are accurate. We update incorrect information upon notification. Read third-party privacy policies when using external links or tools.`,
  },
  {
    title: "Contact Information",
    content: `For questions regarding privacy policies, data usage, or website practices, contact our Customer Support. You can choose to receive communications via phone, email, or unsubscribe from newsletters.`,
  },
];

const PrivacyPolicy: React.FC = () => {
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
        Privacy Policy
      </motion.h2>

      <div className="w-full max-w-6xl flex flex-col gap-8">
        {privacySections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
          >
            <div className="flex items-center mb-4 gap-3">
              <div className="bg-gray-100 p-2 rounded-full flex items-center justify-center">
                {index % 2 === 0 ? (
                  <ShieldCheck className="w-5 h-5 text-gray-700" />
                ) : (
                  <Info className="w-5 h-5 text-gray-700" />
                )}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">{section.title}</h3>
            </div>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
              {section.content}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
    <Footer/>
    </>
  );
};

export default PrivacyPolicy;
