import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(targetDate: Date): TimeLeft {
  const now = new Date().getTime();
  const distance = targetDate.getTime() - now;

  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

interface WeddingCountdownProps {
  weddingDate: string;
}

export const WeddingCountdown: React.FC<WeddingCountdownProps> = ({
  weddingDate,
}) => {
  const target = React.useMemo(() => new Date(weddingDate), [weddingDate]);
  const [timeLeft, setTimeLeft] = React.useState<TimeLeft>(() => getTimeLeft(target));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="flex justify-center items-center w-full px-2">
      <div className="flex justify-center gap-2 sm:gap-4 w-full max-w-2xl">
        <TraditionalCard label="ថ្ងៃ" value={days} />
        <TraditionalCard label="ម៉ោង" value={hours} />
        <TraditionalCard label="នាទី" value={minutes} />
        <TraditionalCard label="វិនាទី" value={seconds} />
      </div>
    </div>
  );
};

const TraditionalCard: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="flex-1 max-w-[80px]"
    >
      <div className="relative aspect-[3/4] w-full flex flex-col items-center justify-center rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] border border-[#BF953F]/40 bg-[#1a1103]/80 backdrop-blur-sm">
        
        {/* Antique Gold Pattern/Kbach texture overlay */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" 
             style={{ 
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18l2.5-2.5L20 13l-2.5 2.5L20 18v2.5L13 25l2.5 2.5L20 23l4.5 4.5 2.5-2.5-7-7z' fill='%23BF953F' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
             }} 
        />

        {/* Traditional Plaque Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#BF953F]/20 via-transparent to-[#B38728]/20" />

        {/* Ornate Corner Accents - Custom Khmer style */}
        <div className="absolute top-1 left-1 w-6 h-6">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#FCF6BA] to-transparent" />
            <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-[#FCF6BA] to-transparent" />
        </div>
        <div className="absolute bottom-1 right-1 w-6 h-6 rotate-180">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#FCF6BA] to-transparent" />
            <div className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-[#FCF6BA] to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center pt-2">
            <div className="h-10 sm:h-14 flex items-center justify-center overflow-hidden px-1">
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={value}
                        initial={{ y: 25, opacity: 0, scale: 0.5 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -25, opacity: 0, scale: 0.5 }}
                        transition={{ 
                            duration: 0.5,
                            ease: [0.4, 0, 0.2, 1] 
                        }}
                        className="text-3xl sm:text-4xl font-black bg-gradient-to-b from-[#FCF6BA] via-[#BF953F] to-[#8A6E2F] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        style={{ fontFamily: 'Taprom' }}
                    >
                        {value.toString().padStart(2, "0")}
                    </motion.span>
                </AnimatePresence>
            </div>

            {/* Khmer Label with traditional ribbon look */}
            <div className="mt-2 relative">
                <div className="absolute inset-0 bg-[#8A6E2F] blur-[8px] opacity-40" />
                <div className="relative px-3 py-1 rounded-sm border border-[#BF953F]/40 bg-gradient-to-b from-[#1a1103] to-[#0d0701] shadow-inner">
                    <span className="text-[0.7rem] sm:text-[0.85rem] font-medium text-[#FCF6BA] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                        {label}
                    </span>
                </div>
            </div>
        </div>

        {/* Bottom Inner Shadow for depth */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#FCF6BA]/20 blur-[1px]" />
      </div>
    </motion.div>
  );
};
