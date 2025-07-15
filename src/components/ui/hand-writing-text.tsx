"use client";

import { motion, Variants } from "framer-motion";
interface HandWrittenTitleProps {
    title?: string;
    subtitle?: string;
}

function HandWrittenTitle({
    title = "Hand Written",
    subtitle = "Optional subtitle",
}: HandWrittenTitleProps) {
    const draw: Variants = {
        hidden: { 
            pathLength: 0, 
            opacity: 0 
        },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { duration: 2.5, type: "spring", bounce: 0 },
                opacity: { duration: 0.5 }
            }
        }
    };

    return (
        <div className="relative w-full max-w-5xl mx-auto min-h-[300px] flex items-center justify-center">
            <div className="absolute inset-0">
                <motion.svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 1400 800"
                    initial="hidden"
                    animate="visible"
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <title>LetterLink</title>
                    <motion.path
                        d="M 1100 200 
                           C 1400 400, 1200 580, 700 620
                           C 300 620, 200 580, 200 400
                           C 200 220, 400 180, 700 180
                           C 1000 180, 1100 280, 1100 280"
                        fill="none"
                        strokeWidth="12"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={draw}
                        className="text-black opacity-90"
                    />
                </motion.svg>
            </div>
            <div className="relative text-center z-10 flex flex-col items-center justify-center">
                <motion.h1
                    className="text-5xl lg:text-7xl font-alata font-semibold text-black leading-tight tracking-tighter flex items-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    {title}
                </motion.h1>
                {subtitle && (
                    <motion.p
                        className="text-m lg:text-m text-gray-800 font-heading italic mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                    >
                        {subtitle}
                    </motion.p>
                )}
            </div>
        </div>
    );
}

export { HandWrittenTitle }
