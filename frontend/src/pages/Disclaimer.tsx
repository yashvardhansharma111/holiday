// Remove any duplicate import of React
import React from "react"; // keep only one
import { motion } from "framer-motion";
import { ShieldCheck, Info } from "lucide-react";
import Footer from "../components/footer";

const Disclaimer: React.FC = () => {
  return (
    <>
    <section className="bg-gradient-to-b from-gray-100 to-gray-50 py-24 px-6 lg:px-20 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl p-10 lg:p-16 overflow-y-auto border border-gray-200"
      >
        <div className="flex items-center justify-center mb-8 gap-3">
          <ShieldCheck className="w-8 h-8 animate-pulse" />
          <h2 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-indigo-950">
            Disclaimer
          </h2>
        </div>

        <div className="space-y-6 text-gray-700 text-justify leading-relaxed text-sm lg:text-base">
          <p>
            This website is managed by <strong>BookHolidayRentals.com</strong>. By surfing, accessing, or making deals on BookHolidayRentals.com, you confirm that you have read and understood our privacy conditions. The services offered are only available to users above 18 years. Reservations made by agencies on behalf of users are not accepted; such bookings will be cancelled with a refund.
          </p>

          <p className="font-semibold flex items-center gap-2 ">
            <Info className="w-5 h-5" />
            While accessing this website:
          </p>

          <ul className="list-disc list-inside space-y-2 pl-5">
            <li>You are responsible for all transactions under your account or name.</li>
            <li>You confirm being above 18 years and have legal rights to make reservations.</li>
            <li>All information you provide is authentic.</li>
            <li>No fraudulent or unlawful activities will be performed.</li>
            <li>No threatening, political, or racist content is shared.</li>
            <li>Content of the website may not be modified, copied, or distributed except booking-related info.</li>
            <li>Keep your account password confidential and use security mechanisms provided.</li>
          </ul>

          <p>
            Accessing this website is at your own risk. We reserve the right to update terms, prices, and other details. Users are expected to comply with these updates. All offers, discounts, and services are subject to change.
          </p>

          <p>
            Copyrights and proprietary rights of the website and content are reserved. Trademarks or logos cannot be used commercially without permission.
          </p>

          <p>
            Third-party links do not indicate endorsement. Services are provided as-is. Users uploading photos certify ownership and virus-free content.
          </p>

          <p>
            Users are responsible for accurate and complete information. We accept no liability for unauthorized access, data breaches, or virus damages. Services are used at your own risk.
          </p>

          <p>
            BookHolidayRentals.com makes no warranty regarding website completeness or accuracy. Users must verify data before transactions. Right to access or make transactions is reserved.
          </p>

          <p>
            All deals with service providers are your responsibility. BookHolidayRentals.com is not responsible for provider-managed data or internet/server failures.
          </p>

          <p className="text-center font-semibold text-gray-800 mt-6">
            Please read this disclaimer carefully before making any reservations.
          </p>
        </div>
      </motion.div>
    </section>
<Footer/>
    </>

  );
};

export default Disclaimer;
