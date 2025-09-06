import React from "react";
import { motion } from "framer-motion";
import { FileText, AlertCircle } from "lucide-react";
import Footer from "../components/footer";

const termsSections = [
  {
    title: "Introduction",
    content: `Prior to making any booking, you must read the terms and conditions laid by BookHolidayRentals.com as it contains important information with respect to your legal rights, remedies, and duties. These comprise various limitations and exclusions, a condition that controls the jurisdiction and venue disputes and responsible to comply with the applicable laws and regulations.`,
  },
  {
    title: "Property Owner Responsibilities",
    content: `Mainly the property owners should understand how the rules and regulations work in their respective cities. Some cities have laws that confine their ability to the accommodation service provider paying the travelers for a short period. In many cities, the accommodation service provider should register, get the permission, or get the license prior to listing a property or accepting requests from the travelers. The local government can vary in defining how they enforce the laws. Before listing a property on BookHolidayRentals.com, the accommodation service provider must go through the local laws.`,
  },
  {
    title: "Platform Usage",
    content: `BookHolidayRentals.com offers an online platform that connects the accommodation service provider to provide a listing to the traveler. These services can be accessed by the travelers as applications for mobile, tablet, and other smart devices. While accessing this website, these terms and conditions are between the travelers and BookHolidayRentals.com. The term accommodation implies residential and other properties. BookHolidayRentals.com content means the content made available through the site, application, or services.`,
  },
  {
    title: "Agreement to Terms",
    content: `While accessing the website, you give consent to comply with and be legally bound with the terms and conditions whether or not you are a registered user. If you do not agree, you have no right to obtain the data or otherwise use the website, application, or service. Failure to access according to terms may be subject to civil and criminal penalties.`,
  },
  {
    title: "Modifications",
    content: `BookHolidayRentals.com reserves the right to modify the content of the website, application, or services at any time without prior notification. After any changes, the "Last Updated" date will be revised on the website. Continuing to use the website after modifications implies acceptance of the updated terms.`,
  },
  {
    title: "Eligibility",
    content: `Access to the BookHolidayRentals.com website is solely intended for persons above 18 years of age. Registration requires providing accurate details including full name and date of birth. Users under 18 must be assisted by parents or guardians.`,
  },
  {
    title: "Account Registration & Security",
    content: `To access full functionalities, you must have an account on BookHolidayRentals.com. You may register directly or via third-party accounts like Google or Facebook. Users are responsible for securing passwords and any activity under their account. Fraudulent activities should be reported immediately.`,
  },
  {
    title: "Listing Accommodation",
    content: `Registered members can create listings including location, capacity, size, features, pricing, and rules. All listings must have a valid physical address. Placement in search results is determined by traveler or provider preferences, ratings, or booking ease. Accommodation service providers must ensure listings are accurate and compliant with agreements.`,
  },
  {
    title: "No Endorsement",
    content: `BookHolidayRentals.com does not endorse any member, listing, or accommodation. Verified images are for pictorial representation only. Travelers must provide accurate information, and providers are responsible for fraudulent activity or damages. Currency conversions and security deposits are the responsibility of travelers and providers.`,
  },
];

const TermsConditions: React.FC = () => {
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
        Terms & Conditions
      </motion.h2>

      <div className="w-full max-w-5xl flex flex-col gap-8">
        {termsSections.map((section, index) => (
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
                  <FileText className="w-5 h-5 text-gray-700" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-700" />
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

export default TermsConditions;
