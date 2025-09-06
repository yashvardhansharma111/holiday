import React from 'react';
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react';

interface FooterLink {
  name: string;
  path: string;
}

interface ContactItem {
  icon: React.ElementType;
  title: string;
  value: string;
  path: string;
}

interface SocialItem {
  icon: React.ElementType;
  bg: string;
  hover: string;
  path: string;
}

const Footer: React.FC = () => {
  // Quick Links
  const companyLinks: FooterLink[] = [
    { name: 'About Us', path: '#/about' }, // <-- hash path
  { name: 'FAQ', path: '#/faq' },
  { name: 'Contact Us', path: '#/contact' },
  { name: 'Disclaimer', path: '#/disclaimer' },
  { name: 'Advertise with Us', path: '#/advertise' },
  { name: 'Vision and Mission', path: '#/vision' },
  { name: 'Get Your Own Business Website', path: 'https://thewebsitesolutions.com/' },
  ];

  // Contact Info
  const contactInfo: ContactItem[] = [
    { icon: Mail, title: 'Email us', value: 'info@bookholidayrental.com', path: 'mailto:info@bookholidayrental.com' },
    // { icon: Phone, title: 'Call us', value: '+1 (234) 567-8900', path: 'tel:+1234567890' },
  ];

  // Social Links
  const socialLinks: SocialItem[] = [
    { icon: Facebook, bg: 'bg-blue-500', hover: 'hover:bg-blue-600', path: 'https://facebook.com' },
    { icon: Instagram, bg: 'bg-gradient-to-r from-purple-500 to-pink-500', hover: 'hover:bg-pink-600', path: 'https://instagram.com' },
    { icon: Linkedin, bg: 'bg-blue-600', hover: 'hover:bg-blue-700', path: 'https://linkedin.com' },
    { icon: Twitter, bg: 'bg-gray-700', hover: 'hover:bg-gray-800', path: 'https://twitter.com' },
  ];

  // Features / Highlights
  const features: { icon: React.ElementType; text: string }[] = [
    { icon: MapPin, text: 'Global Locations Available' },
    { icon: Phone, text: '24/7 Customer Support' },
  ];

  // Bottom links
  const bottomLinks: FooterLink[] = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Cookie Policy', path: '/cookies' },
    { name: 'Refund Policy', path: '/refund' },
  ];

  return (
    <footer className="bg-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      <div className="relative">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Company Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <div className="w-6 h-6 bg-white rounded opacity-90"></div>
                </div>
                <h2 className="text-xl font-bold text-white">BookHolidayRental</h2>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Home Away From Home. Experience luxury vacation rentals with exceptional service and unforgettable memories.
              </p>
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-slate-300 text-sm">
                    <feature.icon className="w-4 h-4 mr-3 text-blue-400" />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-white mb-6">Company</h3>
              <nav className="space-y-4">
                {companyLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.path}
                    className="block text-slate-300 text-sm hover:text-blue-400 transition-colors duration-200 hover:translate-x-1 transform"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>
            </div>

            {/* Contact & Social */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-white mb-6">Contact Us</h3>
              <div className="space-y-4">
                {contactInfo.map((contact, idx) => (
                  <div key={idx} className="flex items-start">
                    <contact.icon className="w-5 h-5 text-blue-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-slate-300 text-sm">{contact.title}</p>
                      <a
                        href={contact.path}
                        className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
                      >
                        {contact.value}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h4 className="text-white font-medium mb-4">Follow Us</h4>
                <div className="flex space-x-3">
                  {socialLinks.map(({ icon: Icon, bg, hover, path }, idx) => (
                    <a
                      key={idx}
                      href={path}
                      className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center ${hover} transition-all duration-200 hover:scale-110 hover:shadow-lg`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-1">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Stay Updated</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Subscribe to get special offers and travel tips.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg">
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6">
                <p className="text-slate-400 text-sm">© 2025 BookHolidayRental. All rights reserved.</p>
                <div className="hidden lg:block w-px h-4 bg-slate-600"></div>
                <p className="text-slate-500 text-xs">Trusted by 50,000+ travelers worldwide</p>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-end gap-6 text-sm">
                {bottomLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.path}
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
