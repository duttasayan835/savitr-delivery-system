import React from "react";

const Topbar = () => {
  return (
    <header className="flex justify-between items-center px-4 md:px-6 border-b h-[40px] md:h-[40px] w-full bg-white text-black text-[15px] md:text-[17px]">
      <div className="flex items-center gap-4 md:gap-8">
        <span className="text-xl md:text-2xl mr-2"><i className="fa-regular fa-user-circle" /></span>
        <button className="hover:underline text-xs md:text-base">Sign In</button>
        <button className="hover:underline text-xs md:text-base">Register</button>
      </div>
      <div className="flex items-center gap-3 md:gap-8">
        <span className="cursor-pointer">&#x25BC;</span>
        <span className="cursor-pointer font-bold">A</span>
        <span className="cursor-pointer">अ</span>
        <span className="text-[14px] md:text-[18px] cursor-pointer" style={{ color: '#2c2a00' }}>हिन्दी</span>
        <span className="cursor-pointer"><i className="fa-solid fa-sitemap"></i></span>
        <span className="cursor-pointer"><i className="fa-solid fa-search"></i></span>
      </div>
    </header>
  );
};

export default Topbar;
