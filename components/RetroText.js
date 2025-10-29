// app/game/components/RetroText.jsx

import React from 'react';
import { motion } from 'framer-motion';

const text = "someday you’ll thank yourself for letting go when it felt impossible";
const words = text.split(" ");

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, 
      delayChildren: 1.0,    
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.01, 
      ease: "linear",
    },
  },
};

export default function RetroText({ onFinish }) { 
  return (
    <div className="text-center p-4 max-w-lg mx-auto">
      <motion.p
        className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight tracking-wider"
        style={{ 
          fontFamily: 'Tahoma, monospace, sans-serif', 
          color: '#FFFFFF', 
          // 💡 PERUBAHAN DI SINI: Ganti warna shadow menjadi BIRU
          textShadow: '0 0 4px #000000, 0 0 8px #000000, 0 0 12px #00FFFF' // Contoh biru neon
          // Atau jika ingin biru yang lebih gelap/klasik:
          // textShadow: '0 0 4px #000000, 0 0 8px #000000, 0 0 12px #0000FF' 
        }} 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onAnimationComplete={() => {
            if (onFinish) onFinish(); 
        }}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={wordVariants}
            className={`inline-block ${index < words.length - 1 ? 'mr-2' : ''}`} 
          >
            {word}
          </motion.span>
        ))}
      </motion.p>
    </div>
  );
}