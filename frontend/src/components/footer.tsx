export default function Footer() {
    const footerSections = [
      {
        title: "Company",
        links: ["About us", "Careers", "Press", "Blog", "Help Center"],
      },
      {
        title: "Discover",
        links: ["Vacation Rentals", "Apartments", "Cabins", "Beach Houses", "Pet-Friendly"],
      },
      {
        title: "Popular Destinations",
        links: ["Florida", "California", "Colorado", "North Carolina", "Texas"],
      },
      {
        title: "Support",
        links: ["Contact Us", "FAQ", "Safety", "Terms of Service", "Privacy Policy"],
      },
    ]
  
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-xl font-bold">home</span>
                  <span className="text-xl font-bold text-purple-400 ml-1">to go_</span>
                </div>
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed">
                The world's largest selection of vacation rentals. Millions of stays. One home.
              </p>
  
              {/* Social Media */}
              <div className="flex space-x-4">
                {["Twitter", "Facebook", "Instagram"].map((social, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors duration-300 cursor-pointer"
                  >
                    <span className="text-xs font-bold">{social[0]}</span>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index}>
                <h5 className="font-semibold text-white mb-4">{section.title}</h5>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
  
          {/* Bottom Section */}
          <div className="border-t border-gray-800 pt-8 flex flex-col lg:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 lg:mb-0">
              <span className="text-gray-400 text-sm">© 2024 HomeToGo. All rights reserved.</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Born in Berlin</span>
                <span className="text-lg">🇩🇪</span>
              </div>
            </div>
  
            <div className="flex items-center space-x-3">
              <select className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>English (US)</option>
                <option>Deutsch</option>
                <option>Français</option>
              </select>
              <select className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>
        </div>
      </footer>
    )
  }
  