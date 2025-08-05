import React, { useState } from "react";
import Topbar from "./components/Topbar";
import LogoBar from "./components/LogoBar";
import Slideshow from "./components/Slideshow";
import MainUtilitySection from "./components/MainUtilitySection";
import NewsUpdatesSection from "./components/NewsUpdatesSection";
import Footer from "./components/Footer";
import NavbarSidebar from "./components/NavbarSidebar";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Topbar />
      <LogoBar />
      {/* Hamburger always visible, absolute between LogoBar and Slideshow */}
      <div className="relative">
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute z-50 top-0 left-1 w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 bg-white shadow hover:shadow-lg hover:border-red-400 transition-all outline-none focus:ring-2 ring-red-500"
          style={{ marginTop: 0, padding: 0 }}
          aria-label="Menu"
        >
          <svg className="w-5 h-5 text-red-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        {/* Sidebar is only rendered and visible when open (all breakpoints) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/30 flex">
            <NavbarSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            {/* Clicking outside closes */}
            <div className="flex-1" onClick={() => setSidebarOpen(false)} />
          </div>
        )}
      </div>
      <Slideshow />
      {/* Main content is always full width, no persistent sidebar */}
      <div className="flex flex-row items-start w-full">
        <div className="flex-1">
          <MainUtilitySection />
        </div>
      </div>
      <NewsUpdatesSection />
      <Footer />
    </div>
  );
}

export default App;
