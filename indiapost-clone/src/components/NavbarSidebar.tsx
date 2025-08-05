import React, { useEffect, useRef } from "react";

// Menu data structure for deep nesting
const MENU = [
  {
    label: "About Us",
    children: [
      { label: "About the Department" },
      { label: "Who is Who" },
      {
        label: "Meet the Minister",
        children: [
          { label: "Cabinet Minister" },
          { label: "Minister of State" },
          { label: "Meet the Secretary" },
          { label: "Meet the DG" },
          { label: "Postal Services Board" },
        ],
      },
      { label: "E-Books",
        children: [
          { label: "e-Books" },
          { label: "Performance Dashboard" },
        ],
      },
    ],
  },
  {
    label: "Mails & Stamps",
    children: [
      {
        label: "Mails",
        children: [
          {
            label: "Premium",
            children: [
              { label: "Speed Post" },
              { label: "India Post Parcel Contractual" },
              { label: "Logistics Post" },
            ],
          },
          {
            label: "Domestic",
            children: [
              { label: "Letter" },
              { label: "Book Post" },
              { label: "Registered Newspaper" },
              { label: "India Post Parcel" },
            ],
          },
          {
            label: "International",
            children: [
              { label: "Letter" },
              { label: "EMS/International speed post" },
              { label: "Air Parcel" },
              { label: "International Tracked Packets" },
              { label: "Export of Commercial Items through Postal Channel" },
              { label: "More Information on International Mail Services" },
              { label: "Postal Rates" },
              { label: "Packaging Tips" },
              { label: "Prohibited Articles" },
            ],
          },
        ],
      },
      { label: "Stamps" },
    ],
  },
  {
    label: "Banking & Remittance",
    children: [
      { label: "Net Banking" },
      { label: "Post Office Savings Scheme" },
      { label: "ePassbook" },
      { label: "Money Order(MO)" },
      { label: "Jansuraksha Scheme" },
      { label: "Mutual Funds" },
      { label: "India Post Payments Bank" },
      { label: "NPS" },
    ],
  },
  {
    label: "Insurance",
    children: [
      { label: "Postal Life Insurance" },
      { label: "Rural Postal Life Insurance" },
      { label: "Pay your PLI Premium" },
      { label: "Guidelines for Insurant/Claimants" },
      { label: "Online purchase of a policy" },
      { label: "Frequently Asked Questions" },
    ],
  },
  {
    label: "Business & Ecommerce",
    children: [
      {
        label: "Business",
        children: [
          {
            label: "Premium Mail Products",
            children: [
              { label: "Book Now Pay Later (BNPL)" },
              { label: "Cash on Delivery (COD) Facility" },
              { label: "Speed Post Discount Structure" },
              { label: "Bill Mail" },
              { label: "Direct Post" },
              { label: "Media Post" },
              { label: "Business Post" },
              { label: "Logistics Post" },
              { label: "e-Payment" },
              { label: "e-Post" },
            ],
          },
        ],
      },
      {
        label: "Ecommerce",
        children: [
          { label: "Buy e-IPO" },
          { label: "Buy Philately Products" },
        ],
      },
    ],
  },
  {
    label: "Retail Services",
    children: [
      { label: "Retail Post" },
      { label: "Aadhaar Updation" },
      { label: "Post Office Passport Seva Kendras" },
      { label: "Gangajal Services" },
      { label: "India Post Passenger Reservation System (PRS)" },
      { label: "Doorstep Service" },
      { label: "Prasadam (Holy Blessing)" },
    ],
  },
  {
    label: "Tools & Help",
  },
];

function SidebarMenu({ menu, depth = 0, onBack, path, openPath, setOpenPath }: any) {
  if (!menu) return null;
  return (
    <ul className={`pl-${depth === 0 ? 0 : 3} mb-0${depth === 0 ? "" : " border-l border-gray-200"}${depth > 0 ? " bg-white rounded-sm mt-1 shadow-sm" : ""}` }>
      {depth > 0 && (
        <li className="mb-1 mt-1 flex">
          <button className="text-xs flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-red-600 font-medium rounded hover:bg-gray-100 transition min-w-[48px] sm:min-w-[64px]" onClick={onBack}>
            <span className="inline-block">←</span> Back
          </button>
        </li>
      )}
      {menu.map((item: any, idx: number) => (
        <li key={item.label} className="my-0.5">
          {item.children ? (
            <button
              className={`flex w-full items-center gap-2 py-2 px-3 rounded-lg border border-transparent transition-all hover:bg-gray-100 hover:border-gray-200 text-sm font-semibold`}
              style={{ justifyContent: 'flex-start', textAlign: 'left', minHeight: '38px', touchAction: 'manipulation' }}
              onClick={() => setOpenPath([...path, idx])}
            >
              {item.label}
              <span className="text-gray-400 ml-auto">▶</span>
            </button>
          ) : (
            <a
              href="#"
              className="flex w-full items-center gap-2 py-2 px-3 rounded-lg border border-transparent text-sm font-medium hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
              tabIndex={0}
            >
              {item.label}
            </a>
          )}
          {item.children && openPath[depth] === idx && openPath.length === depth + 1 && (
            <SidebarMenu
              menu={item.children}
              depth={depth + 1}
              onBack={() => setOpenPath(path)}
              path={[...path, idx]}
              openPath={openPath}
              setOpenPath={setOpenPath}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

export default function NavbarSidebar({ open = false, setOpen = () => {} }: { open: boolean, setOpen: (v: boolean) => void }) {
  const [openPath, setOpenPath] = React.useState([]);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside box or on Esc
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sidebarRef.current && !(sidebarRef.current as any).contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.body.style.overflow = 'hidden'; // no scroll bg
      window.addEventListener('mousedown', handleClick);
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('mousedown', handleClick);
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [open, setOpen]);

  return (
    <div className="fixed inset-0 z-[99] flex justify-start items-stretch bg-black/35 backdrop-blur-sm">
      <div
        ref={sidebarRef}
        className={`relative w-[86vw] max-w-[330px] min-h-full bg-white border-l-4 border-red-600 shadow-2xl rounded-r-xl flex flex-col py-8 px-4 animate-sidebar-drawer`}
        style={{ boxShadow: '0 12px 48px #d0002e22' }}
        tabIndex={-1}
      >
        <button aria-label="Close" className="absolute top-3 right-3 text-lg text-gray-600 hover:text-red-600 transition p-1 focus:outline-none" onClick={() => setOpen(false)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="overflow-y-auto max-h-[96vh] pt-2 mt-4 pr-2">
          <SidebarMenu menu={MENU} openPath={openPath} path={[]} setOpenPath={setOpenPath} />
        </div>
      </div>
    </div>
  );
}

// In tailwind.config.js you would add:
// animation: {
//   'sidebar-drawer': 'sidebarDrawer 0.34s cubic-bezier(.42,0,.58,1) both'
// },
// keyframes: {
//   sidebarDrawer: {
//     '0%': { transform: 'translateX(-80%)', opacity: 0.75 },
//     '98%': { opacity: 1 },
//     '100%': { transform: 'translateX(0)', opacity: 1 }
//   }
// }
