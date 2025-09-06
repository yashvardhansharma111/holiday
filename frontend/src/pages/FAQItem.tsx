import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import Footer from "../components/footer";

interface FAQItem {
  question: string;
  answer: string | string[];
}

const faqData: FAQItem[] = [
 {
    question: "How does it work?",
    answer: `BookHolidayRentals.com is an online platform to rent out your holiday home to travelers across the globe. We’ve made it very simple and convenient to rent out your holiday home and earn an extra income. List your holiday house on our network with the best available pictures, information about the amenities and the rates charged and simply sit back and relax. Travelers across the globe can visit your listing online and if they are interested to book the house they will contact you directly by email using the website’s messaging system.`
  },
  {
    question: "Do I pay you a commission out of my rental income?",
    answer: `We don’t charge any sort of commission either from the property owner’s or from the travelers. We assist rental owners earn an extra income but we do not earn a share of the rental income.`
  },
  {
    question: "Who handles the bookings? What role do you play in the booking process?",
    answer: `We do not play any role in the booking process. Our job is to ensure that the maximum number of travelers view your listing online and contact you for bookings. Once you receive the initial enquiry, you can negotiate with the travelers directly and if satisfied you can secure a booking deposit.`
  },
  {
    question: "What can I do to maximize my chances of receiving a booking request?",
    answer: [
      "Display the maximum number of images that you can.",
      "Make sure that the images are the most recent ones.",
      "If possible, try to change the images to reflect the different seasons. This not only helps you get good business in the main holiday season but also keeps you in good stead for the off-season where you can attempt to showcase the fall or winter season to your advantage.",
      "Take some time out to write a brief description about your property. We believe that you can best describe the qualities and attractions of your house and this will surely provide potential renters an insight about your property.",
      "Regularly update your availability calendar and rates to reflect the most recent status. Not updating the calendar regularly is the most common mistake property owners commit."
    ]
  },
  {
    question: "What precautions should I take before accepting a traveler request?",
    answer: `Your holiday home is your cherished possession and you should take great pride in sharing it with likeminded travelers. However, before committing to a booking request, we would like to advise you to personally speak to your guests over the phone to confirm the exact booking dates, the size of the travelling entourage and any other questions or concerns that you may have. Your holiday house is your labor-of-love and you have the choice to decide who you want to share it with.`
  },
  {
    question: "What can I do to optimally convert traveler enquiries into bookings?",
    answer: `Receiving a traveler enquiry is a small but significant step towards your goal of securing a booking. However, to achieve that goal you need to act quickly and respond to the enquiry as soon as possible while answering and addressing all questions of the travelers. A prompt and exhaustive reply signifies your commitment and makes a great first impression on travelers who will need to communicate with you more often if they do decide to rent your property.`
  },
  {
    question: "I really value my Privacy. What steps do you take to safeguard my personal information?",
    answer: `Rental owners privacy is a serious concern for us and we work diligently to make sure that your personal information stays personal. Your listing page does not feature your personal phone number or email address. Travelers can view an enquiry form titled “Contact the owner” on the listing, if they wish to book the property they can fill this form and these details will reach your inbox through our secure messaging system. After the initial contact you can choose to share information at your own discretion.`
  },
  {
    question: "In what order do the listings appear on the website?",
    answer: `All property listings on the website are sorted according to the three listing tiers – __________. When travelers search for any region they will be presented with all the ___ tier listings at the top, followed by the ___ and ____ tier listings respectively. Listings regularly keep changing positions randomly among their respective tiers to ensure fair representation to all listings. However, we do not brand the listings so travelers cannot distinguish listings from different tiers.`
  },
  {
    question: "I am not good with computers. Can you help me in creating or editing my property advert?",
    answer: `You don’t need to have great computer skills to announce your house on our website. We have designed a very simple and uncomplicated “owners section” which you can navigate easily to create your listing. But if you still need help, we are there to assist you through the process. You can email us at info@BookHolidayRentals.com or call us at ___ and our customer support executive will be happy to assist you to create or edit your listing.`
  },
  {
    question: "Can I get a link to my personal website?",
    answer: `Yes, we can offer a link to your personal website. However, this option is only available with the _____.`
  },
  {
    question: "Is it possible to synchronize my calendar?",
    answer: `We understand that many property owners and property management companies use various online platforms to promote their rentals, hence it can be quite tedious to update availability across these platforms. We offer you the option to synchronize your availability calendar with channel managers such as I-cal and Kigo.`
  }
  // You can continue adding the rest of the FAQs here...
];

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
     <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-30 px-6 lg:px-20 min-h-screen flex justify-center items-start">
      <div className="max-w-5xl w-full ">
        <h2 className="text-5xl font-bold text-gray-900 text-center mb-16 drop-shadow-md">
          Frequently Asked Questions
        </h2>

        <div className="space-y-5">
          {faqData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden hover:scale-[1.02] hover:shadow-3xl transition-all duration-300"
            >
              <button
                onClick={() => toggleIndex(index)}
                className="w-full flex justify-between items-center px-6 py-5 text-left bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 transition-colors rounded-t-2xl"
              >
                <span className="text-gray-900 font-semibold text-lg md:text-xl">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-6 h-6 text-gray-700" />
                </motion.div>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="px-6 pb-6 text-gray-700 text-base md:text-lg leading-relaxed bg-white"
                  >
                    {Array.isArray(item.answer)
                      ? item.answer.map((ans, i) => (
                          <p key={i} className="mb-3 flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span> {ans}
                          </p>
                        ))
                      : <p>{item.answer}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    <Footer/>
    </>
  );
};

export default FAQ;
