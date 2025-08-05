import React, { useEffect, useRef, useState } from "react";

const IMAGES = [
  "https://files.catbox.moe/4tan1d.jpg",
  "https://www.indiapost.gov.in/VASHindi/PublishingImages/WebBanner3D.jpg",
  "https://files.catbox.moe/eoix64.jpg"
];

const AUTO_DURATION = 3500;

const Slideshow = () => {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Utility for manual navigation and resetting timer
  const goTo = (newIdx: number) => {
    setIndex(newIdx);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, AUTO_DURATION);
  };

  // Setup / cleanup autoplay timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, AUTO_DURATION);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const prevSlide = () => goTo((index - 1 + IMAGES.length) % IMAGES.length);
  const nextSlide = () => goTo((index + 1) % IMAGES.length);

  return (
    <div className="w-full flex flex-col items-center justify-center bg-white mt-2 mb-2 px-0 sm:px-2">
      <div
        className="relative w-full max-w-xl md:max-w-3xl lg:max-w-5xl h-[28vh] min-h-[140px] md:h-[230px] lg:h-[280px] 2xl:h-[320px] rounded-md overflow-hidden shadow group"
      >
        {IMAGES.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt={`slide-${idx}`}
            className={`absolute w-full h-full object-cover left-0 top-0 transition-opacity duration-700 ${
              index === idx ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            draggable={false}
          />
        ))}
        {/* Left arrow */}
        <button
          onClick={prevSlide}
          aria-label="Prev"
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.85)] text-lg sm:text-2xl rounded-full w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center font-bold shadow hover:bg-red-100 transition-opacity opacity-85 group-hover:opacity-100 z-20"
        >
          {"<"}
        </button>
        {/* Right arrow */}
        <button
          onClick={nextSlide}
          aria-label="Next"
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.85)] text-lg sm:text-2xl rounded-full w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center font-bold shadow hover:bg-red-100 transition-opacity opacity-85 group-hover:opacity-100 z-20"
        >
          {">"}
        </button>
      </div>
      <div className="flex gap-2 mt-2">
        {IMAGES.map((src, idx) => (
          <button
            key={src}
            onClick={() => goTo(idx)}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-gray-400 ${index === idx ? "bg-red-600" : "bg-gray-200"}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slideshow;
