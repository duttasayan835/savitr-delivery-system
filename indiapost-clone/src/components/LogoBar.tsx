import React from "react";

const LogoBar = () => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between items-center px-2 md:px-8 py-4 bg-white border-b gap-4 md:gap-0">
      <div className="flex flex-col sm:flex-row items-center justify-center w-full md:w-auto gap-2 md:gap-0">
        {/* India Post Logo */}
        <img
          src="https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/India_Post_Logo_With_Text.svg"
          alt="India Post Logo"
          className="h-16 sm:h-20 md:h-28 w-auto"
        />
        <div className="ml-0 sm:ml-4 text-left flex flex-col items-center sm:items-start mt-2 sm:mt-0">
          <div className="text-base sm:text-lg md:text-xl font-serif text-[#c30000] leading-tight">
            भारतीय डाक<br/>
            <span className="text-xs sm:text-sm text-black">उत्कृष्ट सेवा-जन सेवा</span>
          </div>
          <div className="text-base md:text-lg text-[#c30000]">India Post</div>
          <div className="text-xs text-gray-700">Dak Sewa-Jan Sewa</div>
        </div>
      </div>
      <div className="flex gap-4 md:gap-10 items-center w-full md:w-auto justify-center md:justify-end">
        <img src="https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/G20.png" alt="G20" className="h-10 sm:h-12 md:h-16 w-auto"/>
        <img src="https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/right_side_logo.png" alt="Azadi logo" className="h-8 sm:h-10 md:h-14 w-auto"/>
        <img src="https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/Emblem_of_India.svg" alt="Emblem" className="h-10 sm:h-12 md:h-16 w-auto"/>
      </div>
    </div>
  );
};

export default LogoBar;
