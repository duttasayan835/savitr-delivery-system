'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { useInView } from 'react-intersection-observer';
import { Package, MapPin, Clock } from 'lucide-react';

interface TrackingCardProps {
  consignmentId: string;
  status: string;
  location: string;
  timestamp: string;
  isLatest?: boolean;
}

export default function TrackingCard({
  consignmentId,
  status,
  location,
  timestamp,
  isLatest = false
}: TrackingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date not available';
      }
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (error) {
      return 'Date not available';
    }
  };

  useEffect(() => {
    if (inView && cardRef.current) {
      // Use CSS transitions instead of animejs
      cardRef.current.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
      cardRef.current.style.transform = 'translateY(0)';
      cardRef.current.style.opacity = '1';
    }
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Tilt
        tiltMaxAngleX={5}
        tiltMaxAngleY={5}
        scale={1.02}
        transitionSpeed={2000}
        className="w-full"
      >
        <div
          ref={cardRef}
          className={`relative p-6 rounded-xl shadow-md ${
            isLatest 
              ? 'bg-gradient-to-r from-red-600 to-red-700' 
              : 'bg-white hover:bg-gray-50'
          } transform transition-all duration-300 hover:shadow-lg border ${
            isLatest ? 'border-red-500' : 'border-gray-100'
          }`}
          style={{ transform: 'translateY(50px)', opacity: 0 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -mr-16 -mt-16 opacity-50" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-100 rounded-full -ml-16 -mb-16 opacity-50" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Package className={`h-5 w-5 mr-2 ${isLatest ? 'text-white' : 'text-red-600'}`} />
                <h3 className={`text-lg font-semibold ${isLatest ? 'text-white' : 'text-gray-800'}`}>
                  {status}
                </h3>
              </div>
              <div className="flex items-center">
                <Clock className={`h-4 w-4 mr-1 ${isLatest ? 'text-red-100' : 'text-gray-400'}`} />
                <span className={`text-sm ${isLatest ? 'text-red-100' : 'text-gray-500'}`}>
                  {formatDate(timestamp)}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className={`h-4 w-4 mr-2 mt-1 ${isLatest ? 'text-red-100' : 'text-gray-400'}`} />
                <p className={`${isLatest ? 'text-white' : 'text-gray-600'}`}>
                  <span className="font-medium">Location:</span> {location}
                </p>
              </div>
            </div>

            {isLatest && (
              <div className="mt-4 pt-4 border-t border-red-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-red-100">Latest Update</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Tilt>
    </motion.div>
  );
} 