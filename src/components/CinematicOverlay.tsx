import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CinematicSequence } from '../types';

interface CinematicOverlayProps {
  active: boolean;
  sequence?: CinematicSequence;
  onComplete?: () => void;
}

export default function CinematicOverlay({ active, sequence, onComplete }: CinematicOverlayProps) {
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    if (!active || !sequence) return;

    // Handle Subtitles
    const subtitleTimers = sequence.subtitles.map(sub => {
      const startTimer = setTimeout(() => setCurrentSubtitle(sub.text), sub.timestamp * 1000);
      const endTimer = setTimeout(() => setCurrentSubtitle(null), (sub.timestamp + sub.duration) * 1000);
      return [startTimer, endTimer];
    }).flat();

    // Handle Title Card
    const titleIn = setTimeout(() => setShowTitle(true), 500);
    const titleOut = setTimeout(() => setShowTitle(false), 4000);

    // Sequence Duration
    const totalDuration = sequence.cameraPath.reduce((acc, p) => acc + p.duration, 0);
    const endTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, totalDuration * 1000);

    return () => {
      subtitleTimers.forEach(t => clearTimeout(t));
      clearTimeout(titleIn);
      clearTimeout(titleOut);
      clearTimeout(endTimer);
    };
  }, [active, sequence, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-[1000] flex flex-col justify-between overflow-hidden">
          {/* Top Bar */}
          <motion.div 
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-[12vh] bg-black"
          />

          {/* Center Content */}
          <div className="flex-1 relative flex items-center justify-center">
            <AnimatePresence>
              {showTitle && sequence?.title && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, letterSpacing: '0.5em' }}
                  animate={{ opacity: 1, scale: 1, letterSpacing: '0.2em' }}
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                  transition={{ duration: 2 }}
                  className="text-center"
                >
                  <h1 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-[0.2em] mb-4 font-sans drop-shadow-2xl">
                    {sequence.title}
                  </h1>
                  {sequence.subtitle && (
                    <p className="text-sm md:text-lg text-accent font-mono uppercase tracking-[0.4em] opacity-80">
                      {sequence.subtitle}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subtitles */}
            <div className="absolute bottom-12 w-full text-center px-8">
              <AnimatePresence mode="wait">
                {currentSubtitle && (
                  <motion.p
                    key={currentSubtitle}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-white/90 text-lg font-medium drop-shadow-lg max-w-2xl mx-auto italic"
                  >
                    "{currentSubtitle}"
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Bar */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-[12vh] bg-black"
          />
        </div>
      )}
    </AnimatePresence>
  );
}
