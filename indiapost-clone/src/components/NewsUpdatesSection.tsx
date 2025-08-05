import React, { useState } from "react";

const TAB_CONTENTS = {
  'News & Updates': [
    {
      date: '17Apr',
      badge: 'New',
      text: 'Extension of time period for submission of Postal Circle preference from selected candidates recommended by Staff Selection Commission, on the basis of CGLE – 2024, for appointment as Postal Assistant/ Sorting Assistant in Department of Posts',
      pdf: true,
      size: '[92 KB]'
    },
    {
      date: '16Apr',
      badge: 'New',
      text: 'Extension of time period for submission of Postal Circle preference from selected candidates recommended by Staff Selection Commission, on the basis of CGLE – 2024, for appointment as Postal Assistant/ Sorting Assistant in Department of Posts',
      pdf: false
    }
  ],
  'Tenders': [
    {
      date: '12Apr',
      badge: 'Open',
      text: 'E-Tender for supply of A4 Paper for printing machines at various circle offices.',
      pdf: true,
      size: '[122 KB]'
    },
    {
      date: '09Apr',
      badge: 'Closed',
      text: 'Empanelment of Vendors for Courier Services — Applications now closed.',
      pdf: false,
    }
  ],
  'Notifications': [
    {
      date: '15Apr',
      badge: 'Alert',
      text: 'Scheduled website maintenance will occur on 18th April from 10PM to 12AM.',
      pdf: false,
    },
    {
      date: '10Apr',
      badge: 'Update',
      text: 'Change in the timings of certain post offices in the Mumbai region.',
      pdf: true,
      size: '[77 KB]'
    }
  ],
  'Recruitment': [
    {
      date: '11Apr',
      badge: 'Hiring',
      text: 'Recruitment for the posts of Postal Assistants and Sorting Assistants—apply by 30 April 2025.',
      pdf: true,
      size: '[188 KB]'
    },
    {
      date: '08Apr',
      badge: 'Extended',
      text: 'Date extension for submission of recruitment application for the post of Postman/Stenographer.',
      pdf: false,
    }
  ],
};

const TABS = ["News & Updates", "Tenders", "Notifications", "Recruitment"] as const;
type TabType = typeof TABS[number];

const NewsUpdatesSection = () => {
  const [tab, setTab] = useState<TabType>(TABS[0]);

  return (
    <section className="w-full flex flex-col lg:flex-row px-2 sm:px-4 lg:px-8 py-4 lg:py-8 gap-4 lg:gap-10">
      {/* Helpline - stacks on top for sm */}
      <div className="w-full lg:w-[330px] bg-white border rounded p-4 sm:p-6 flex flex-col items-center justify-start mb-2 lg:mb-0">
        <img src="https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/Telephone%20Icon.svg" alt="helpline" className="h-9 sm:h-12 mb-2 sm:mb-3"/>
        <div className="text-sm sm:text-base">Toll Free Enquiry Helpline:</div>
        <div className="text-blue-700 font-bold text-base sm:text-lg mb-1">18002666868</div>
        <div className="text-xs sm:text-sm mb-1">9:00 AM - 6:00 PM</div>
        <div className="text-xs text-gray-500 mb-1">(Except Sundays & Gazetted Holidays)</div>
        <div className="text-[13px] sm:text-md font-bold text-black mb-2 sm:mb-3">IVRS facility is available 24*7*365</div>
        <div className="text-blue-900 font-bold underline cursor-pointer mb-0.5">Register your complaint</div>
        <div className="text-blue-800 underline cursor-pointer mb-0.5 text-xs sm:text-sm">Track Complaint</div>
        <div className="text-xs text-gray-600">(Registered before 7-March-2025)</div>
      </div>
      {/* Tabs & news list - responsive */}
      <div className="flex-1 bg-white border rounded p-4 sm:p-6">
        <div className="flex gap-2 sm:gap-6 border-b mb-3 sm:mb-4 overflow-x-auto scrollbar-hide whitespace-nowrap">
          {TABS.map((tabName) => (
            <div
              key={tabName}
              onClick={() => setTab(tabName)}
              className={`pb-1 cursor-pointer px-0.5 sm:px-2 text-[10px] sm:text-xs md:text-base whitespace-nowrap ${tab === tabName ? "font-semibold border-b-2 border-blue-500" : "text-blue-600"}`}
            >
              {tabName}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:gap-5 mt-2">
          {(TAB_CONTENTS[tab] || []).map((item, idx) => (
            <div key={item.date+item.badge} className="flex flex-col sm:flex-row gap-2 items-start font-medium text-xs sm:text-base">
              <div className="flex items-center gap-2 min-w-[64px]">
                <span className="font-semibold" style={{color: '#222'}}>{item.date}</span>
                <span className="inline-block px-2 py-[2px] text-xs rounded bg-yellow-200 text-red-700 font-semibold h-fit align-middle ml-1">{item.badge}</span>
              </div>
              <span className="text-blue-800 break-words flex-1">{item.text}</span>
              <div className="flex items-center gap-2 min-w-[56px]">
                {item.pdf && <span className="inline-block" title="PDF"><img src="https://cdn-icons-png.flaticon.com/512/337/337946.png" alt="PDF" className="h-5 inline"/></span>}
                {item.size && <span className="text-xs">{item.size}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsUpdatesSection;
