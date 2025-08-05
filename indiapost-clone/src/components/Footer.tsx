import React from "react";

const footerLinks = [
  "Home",
  "Tenders India",
  "About Us",
  "Related sites",
  "Forms",
  "Website Policies",
  "Recruitments",
  "Contact Us",
  "Holidays",
  "Employee Corner",
  "Feedback",
  "Sitemap",
  "Right To Information",
  "Help"
];

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t px-2 sm:px-6 lg:px-10 py-6 sm:py-8 mt-10 text-gray-700">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-8 w-full">
        {/* Site links columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[13px] sm:text-sm min-w-[0] flex-1 order-1">
          {footerLinks.map((item) => (
            <a
              key={item}
              href="#"
              className="hover:underline hover:text-red-700 transition-colors duration-100 cursor-pointer whitespace-nowrap py-1"
            >
              {item}
            </a>
          ))}
        </div>
        {/* External links Block*/}
        <div className="min-w-[0] flex flex-col items-center flex-1 order-2 lg:order-none my-4 lg:my-0">
          <div className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm">External Links</div>
          <img src="https://www.indiapost.gov.in/PublishingImages/portalofindia.jpg" className="h-7 sm:h-10 mb-1" alt="india.gov.in"/>
          <span className="text-[11px] sm:text-xs text-gray-700">National Voter's Service Portal</span>
          <span className="text-[11px] sm:text-xs text-gray-700">India Code</span>
          <span className="text-[11px] sm:text-xs text-gray-700 mb-3">Application Security Audit Report</span>
        </div>
        {/* Social icons */}
        <div className="flex flex-row items-center flex-1 justify-center gap-3 sm:gap-4 mb-3 mt-2 lg:mt-0 min-w-[0] order-3">
          <img className="h-6 w-6 sm:h-8 sm:w-8" src="https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/faceBookicon_new.png" alt="Facebook"/>
          <img className="h-6 w-6 sm:h-8 sm:w-8 border rounded-full" src="https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/twitterImage_new.png" alt="X"/>
          <img className="h-6 w-6 sm:h-8 sm:w-8" src="https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/youtubeicon_new.png" alt="YouTube"/>
          <img className="h-6 w-6 sm:h-8 sm:w-8" src="https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/instagramicon_new.png" alt="Instagram"/>
          <img className="h-6 w-6 sm:h-8 sm:w-8" src="https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/comment-dots_new.png" alt="Chat"/>
        </div>
      </div>
      <div className="mt-4 sm:mt-5 text-center text-[11px] sm:text-xs text-gray-800 break-words px-1">
        This website belongs to <span className="font-semibold text-black">Department of Posts, Ministry of Communications, GoI</span>. Created and Managed by <span className="text-blue-800 font-semibold">Tata Consultancy Services Ltd.</span><br />
        Content owned and updated by Department of Posts, Ministry of Communications, Government of India. Last Updated: <span className="font-bold">17 Apr 2025</span>
      </div>
    </footer>
  );
};

export default Footer;
