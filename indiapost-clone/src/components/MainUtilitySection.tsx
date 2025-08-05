import React from "react";
import { SAVITR_AI_URL } from "../config/urls";

const clickableUtilityLinks = [
  {
    href: "https://www.indiapost.gov.in/VAS/Pages/CalculatePostage.aspx",
    icon: "https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/Calculator_Icon.svg",
    title: "Calculate Postage"
  },
  {
    href: "https://www.indiapost.gov.in/vas/pages/findpincode.aspx",
    icon: "https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/Find_Pincode_Icon.svg",
    title: "Find Pincode"
  },
  {
    href: "https://www.indiapost.gov.in:8080/siteminderagent/forms/login.fcc?SMQUERYDATA=-SM-CQ1NhI%2bj0t7ibOVTHX35CY4SIrp7mrCGpOzvuJ5BeoaDngYbBkdZq2ysABwZq4ozfd%2bFp82PWG%2btRtgV1x1iuI3GoaZDpcyNJq9e61qn1kGHoyCYoX80zDmxJ7OoqzjaB3PbADaSi19X1eQF%2fi%2bVJQivXJ7yhKXIZFGgrXz4nKHmy0zb4DaSh81LtuKlr0Mty06Qx%2b9o1rLpoWTGPCAV%2bNJVSNQeOgJnMfpYMFQQ3wTvj%2bYDi4HhNilnGqjGMrmIEH2Zr3eGlKcP%2b9TPkdOxkfOFEQPWz7lVRA3SIW3OgByowP25gIHuRDcl4FMLauGPisci0kQGhN%2blI%2fB5%2fKww6rJsPidGBLrSpZW8tdBoqlgV6cS%2byXTuWXu2mRCtWnGuepCfid0lEsTGAJoQ2Yksp0%2bU%2bhWZwMQkabRDvhDAS1CzCq0lOqMnWB%2beC8R1CLv7Tl2fcvgYhNwokBwKXFjPrFP5EXzcIFthHPRuS%2fwsfci5qa6UGkBZ2LMsuFlh5ey3dLCL8TstO0JK%2fJEc9jGM2SuCA4WrcB05tosnjmRwMjp095Z40JQ2SUpOJHhqc9WpJCYESES9k%2byM0EZTo1sW3JxUhFxrybdUC9XQ9Ml5nI3%2b1KJlJf0i7gkiFt%2bQ%2fPfmcIyTxOMEU4D6sWLfxtcbE8R%2b%2bpIeZ3LIWu8LK%2bwKo8QIkvZAM%2bsS8s%2fflrEVtE%2f30AQS9r0Mh93jh0E6UxJuS5zQh6kLbfEaisn4PWE75H5f3erGqkfkLFAp942c3Wfb",
    icon: "https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/Click_N_Book_Icon.svg",
    title: "Click n Book"
  },
  {
    href: "https://www.indiapost.gov.in/Philately/Pages/Content/Buy-Stamp.aspx",
    icon: "https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/india-post-buy-stamps-Icon.svg",
    title: "Buy Stamps"
  },
  {
    href: "https://www.indiapost.gov.in/vas/pages/LocatePostOffices.aspx",
    icon: "https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/Locate_your_post_office_Icon.svg",
    title: "Locate Post Office"
  },
  {
    href: "https://pli.indiapost.gov.in/CustomerPortal/Home.action",
    icon: "https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/PLI_Logo.svg",
    title: "Postal Life Insurance"
  }
];

const clickableSecondRowLinks = [
  {
    href: "https://www.dakkarmayogi.gov.in/doptrg/",
    icon: "https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/DKP.png",
    title: "Dak Karmayogi Portal"
  },
  {
    href: "https://dnk.cept.gov.in/customers.web/",
    icon: "https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/DNK.png",
    title: "Dak Ghar Niryat Portal"
  },
  {
    href: "https://www.indiapost.gov.in/Financial/Pages/Content/Post-Office-Saving-Schemes.aspx",
    icon: "https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/Post_office_savings_bank_Icon.svg",
    title: "Post Office Savings Bank"
  },
  {
    href: "https://www.ippbonline.com/",
    icon: "https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/IPPB_Logo.svg",
    title: "India Post Payments Bank"
  },
  {
    href: SAVITR_AI_URL,
    icon: "https://files.catbox.moe/ja0z2x.jpg",
    title: "Savitr-AI"
  }
];

const MainUtilitySection = () => {
  // Small-screen utilities in 2 cols row-grid
  const allUtils = [...clickableUtilityLinks, ...clickableSecondRowLinks];
  return (
    <section className="flex flex-col md:flex-row px-2 sm:px-4 md:px-6 py-5 gap-3 md:gap-5 w-full">
      {/* Track N Trace */}
      <div className="w-full md:w-[250px] flex flex-col items-center justify-start border p-2 md:p-3 rounded bg-white shadow-sm mx-auto md:mx-0 mb-4 md:mb-0">
        <div className="flex flex-col items-center mb-1">
          <img src="https://www.indiapost.gov.in/_layouts/15/images/DOP.Portal.UILayer/Track_Trace_Icon.svg" alt="Track icon" className="h-8 mb-1"/>
          <div className="text-sm md:text-base font-semibold text-red-800 mb-1 mt-1">Track N Trace</div>
          <div className="flex items-center gap-2 text-xs mb-1">
            <label className="flex items-center gap-1"><input type="radio" defaultChecked className="scale-75"/> Consignment</label>
            <label className="flex items-center gap-1"><input type="radio" className="scale-75"/> Ref No</label>
          </div>
          <input type="text" placeholder="Enter consignment number" className="border rounded px-2 py-1 w-full text-xs mb-1" />
          <div className="flex items-center gap-1 mb-1 w-full">
            {/* Captcha Placeholder */}
            <img src="https://www.indiapost.gov.in/_layouts/15/DOP.Portal.UILayer/Captcha.aspx?Ran=xkwZm+/p2LA=" alt="captcha" className="h-6 w-20" />
            <button className="border rounded px-1 py-0.5 text-xs"><span role="img" aria-label="refresh">🔄</span></button>
            <button className="border rounded px-1 py-0.5 text-xs"><span role="img" aria-label="audio">🔊</span></button>
            <input type="text" placeholder="" className="border rounded px-1 py-1 w-12 text-xs" />
          </div>
          <button className="bg-gradient-to-t from-gray-200 to-white px-2 py-1 rounded shadow text-xs font-medium hover:from-gray-300 transition">Track Now</button>
          <div className="mt-1"><span className="text-xs text-red-700">e-Receipt</span></div>
        </div>
      </div>
      {/* Responsive grid for utilities and ministers */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Mobile/tablet: 2-per-row grid, md+: classic 2-row grid */}
        <div className="w-full">
          <div className="grid grid-cols-2 gap-2 md:hidden py-1">
            {allUtils.map(({ href, icon, title }) => (
              <a
                key={title}
                href={href}
                className="group flex flex-col items-center min-w-0 px-1 gap-1 py-2 text-xs hover:text-red-700 hover:underline transition-colors outline-none"
              >
                <div className="text-lg mb-1 group-hover:scale-110 transition-transform">{icon}</div>
                <div className="text-xs text-red-900 text-center font-semibold leading-tight break-words">{title}</div>
              </a>
            ))}
          </div>
          <div className="hidden md:grid grid-cols-7 gap-x-1 gap-y-0 items-stretch">
            {clickableUtilityLinks.map(({ href, icon, title }) => (
              <a
                key={title}
                href={href}
                className="group flex flex-col items-center min-w-[80px] max-w-[115px] px-1 gap-1 break-words py-2 hover:text-red-700 focus:text-red-700 hover:underline transition-colors outline-none"
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                  {
    <img src={icon} alt={title} className="w-10 h-10 object-contain" />
   }
   </div>
                <div className="text-xs text-red-900 text-center font-semibold leading-tight whitespace-pre-wrap break-words">{title}</div>
              </a>
            ))}
            {/* Top minister */}
            <MinisterCard
              img="https://www.indiapost.gov.in/VAS/PublishingImages/CabinetMinister.jpg"
              name="MOC, Shri Jyotiraditya M. Scindia"
            />
            {clickableSecondRowLinks.map(({ href, icon, title }) => (
              <a
                key={title}
                href={href}
                className="group flex flex-col items-center min-w-[80px] max-w-[115px] px-1 gap-1 break-words py-2 hover:text-red-700 focus:text-red-700 hover:underline transition-colors outline-none"
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
  {
    <img src={icon} alt={title} className="w-10 h-10 object-contain" />
   }
</div>
                <div className="text-xs text-red-900 text-center font-semibold leading-tight whitespace-pre-wrap break-words">{title}</div>
              </a>
            ))}
            <div />
            {/* Bottom minister */}
            <MinisterCard
              img="https://www.indiapost.gov.in/VAS/PublishingImages/MinisterOfState.jpg"
              name="MOS, Dr. Chandra Sekhar Pemmasani"
            />
          </div>
        </div>
        {/* Ministers below for mobile/tablet */}
        <div className="flex md:hidden flex-row justify-center gap-3 mt-3">
          <MinisterCard
            img="https://www.indiapost.gov.in/VAS/PublishingImages/CabinetMinister.jpg"
            name="MOC, Shri Jyotiraditya M. Scindia"
          />
          <MinisterCard
            img="https://www.indiapost.gov.in/VAS/PublishingImages/MinisterOfState.jpg"
            name="MOS, Dr. Chandra Sekhar Pemmasani"
          />
        </div>
      </div>
    </section>
  );
};

const MinisterCard = ({ img, name }: { img: string; name: string }) => (
  <div className="flex flex-col items-center justify-center h-full mt-1 mb-2 w-[90px] max-w-[110px]">
    <img src={img} alt={name} className="w-12 h-12 md:w-14 md:h-14 rounded mb-1 object-cover" />
    <span className="text-xs text-blue-800 font-medium text-center whitespace-pre-line leading-tight">{name}</span>
  </div>
);

export default MainUtilitySection;
