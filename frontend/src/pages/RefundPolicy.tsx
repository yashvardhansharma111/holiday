import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle } from "lucide-react";
import Footer from "../components/footer";

const refundSections = [
  {
    title: "Overview",
    content: `If the accommodation service provider cancels your booking, you can request a refund to your account. If you face issues during your travel and cannot complete your trip with BookHolidayRentals.com, the refund policy will apply.`,
  },
  {
    title: "Possible Travel Issues",
    content: `The refund policy applies in the following situations:
- The accommodation service provider is unable to provide access to the booked accommodation.
- Misinterpretation in the accommodation.
- The accommodation or place of visit is not clean, unsafe, or differs from the description.`,
  },
  {
    title: "Refund Process",
    content: `BookHolidayRentals.com will either issue a refund or make efforts to arrange another booking for any unused nights. The refund amount depends on the type of travel issue.`,
  },
  {
    title: "Claiming a Refund",
    content: `To claim a refund:
- Contact BookHolidayRentals.com within 24 hours of check-in and provide evidence of the travel issue.
- Respond to requests for additional information promptly.
- Ensure you did not cause the travel issue directly or indirectly.
- Attempt to resolve the issue with the accommodation provider first via the platform.
- Refer to the cancellation policy for details regarding minimum quality requirements.`,
  },
  {
    title: "Other Considerations",
    content: `- If issues arise due to software, hardware, network, or system failures, BookHolidayRentals.com is responsible for the refund.
- Accommodation providers may cancel bookings anytime; payments made prior to cancellation may be non-refundable.
- Travelers may access services for which they have paid until the service duration expires.
- Refunds require consent from both the accommodation provider and BookHolidayRentals.com and verification of the situation.
- Travelers must ensure they understand the refund policy before booking.`,
  },
];

const RefundPolicy: React.FC = () => {
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
        Refund Policy
      </motion.h2>

      <div className="w-full max-w-5xl flex flex-col gap-8">
        {refundSections.map((section, index) => (
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
                  <RefreshCw className="w-5 h-5 text-gray-700" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-gray-700" />
                )}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">{section.title}</h3>
            </div>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed whitespace-pre-line">
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

export default RefundPolicy;
