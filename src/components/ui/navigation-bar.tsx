"use client" 

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Pen, BookOpen, Clock, User } from "lucide-react"

interface NavItem {
  name: string;
  icon: React.ElementType;
  sectionId: string;
}

const NavigationBar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const navItems: NavItem[] = [
    { name: "Write Now", icon: Pen, sectionId: "write" },
    { name: "How It Works", icon: BookOpen, sectionId: "how-it-works" },
    { name: "Delivery Times", icon: Clock, sectionId: "delivery-times" },
    { name: "Sign In", icon: User, sectionId: "sign-in" }
  ]

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-center w-full py-4 px-4">
        <div className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg w-full max-w-4xl relative">
          <div className="flex items-center">
            <motion.div
              className="w-8 h-8 mr-6 cursor-pointer"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.3 }}
              onClick={() => scrollToSection('header')}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="url(#paint0_linear)" />
                <defs>
                  <linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6469ff" />
                    <stop offset="1" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
            <span 
              className="text-lg font-alata text-gray-900 cursor-pointer hover:text-primary transition-colors" 
              onClick={() => scrollToSection('header')}
            >
              LetterLink
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <button
                  onClick={() => scrollToSection(item.sectionId)}
                  className="flex items-center gap-2 text-sm text-gray-900 hover:text-primary transition-colors font-alata"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </button>
              </motion.div>
            ))}
          </nav>

          {/* Desktop CTA Button */}
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <a
              href="#"
              className="inline-flex items-center justify-center px-5 py-2 text-sm text-white bg-primary rounded-full hover:bg-primary/90 transition-colors font-alata"
            >
              Get Started
            </a>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button className="md:hidden flex items-center" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
            <Menu className="h-6 w-6 text-gray-900" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-gray-900" />
            </motion.button>
            <div className="flex flex-col space-y-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <button 
                    className="flex items-center gap-3 text-base text-gray-900 font-alata" 
                    onClick={() => scrollToSection(item.sectionId)}
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                    {item.name}
                  </button>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6"
              >
                <a
                  href="#"
                  className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-white bg-primary rounded-full hover:bg-primary/90 transition-colors font-alata"
                  onClick={toggleMenu}
                >
                  Get Started
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { NavigationBar }
