'use client';

import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  message?: string;
}

export default function LoadingAnimation({ message = 'Loading...' }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-300 border-t-transparent rounded-full"
        />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-gray-600 font-medium"
      >
        {message}
      </motion.p>

      <div className="flex space-x-2 mt-4">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              y: [0, -10, 0]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2
            }}
            className="w-2 h-2 bg-blue-500 rounded-full"
          />
        ))}
      </div>
    </div>
  );
} 