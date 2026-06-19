"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Home, Target, Ticket, MessageSquare, ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";
import LiveClock from "@/components/LiveClock";
import RulesModal from "@/components/RulesModal";
import "./ScrollNavbar.css"; // Keep using the CSS we made earlier for the floating menu

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { scrollY } = useScroll();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const menuVariants = {
    closed: { opacity: 0, scale: 0.8, y: -50, transition: { type: "spring", stiffness: 300, damping: 30, when: "afterChildren", staggerChildren: 0.05, staggerDirection: -1 } },
    open: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30, when: "beforeChildren", staggerChildren: 0.1 } }
  };

  const itemVariants = {
    closed: { y: 20, opacity: 0, scale: 0.8 },
    open: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } }
  };

  const hamburgerVariants = {
    normal: { rotate: 0, scale: 1 },
    scrolled: { rotate: 360, scale: 1.1 }
  };

  const mobileMenuItems = [
    { id: 1, title: "HOME", url: "/", icon: <Home size={20} /> },
    { id: 2, title: "BOOKING", url: "/booking", icon: <Target size={20} /> },
    { id: 3, title: "TICKETS", url: "/tickets", icon: <Ticket size={20} /> },
    { id: 4, title: "DISCORD", url: "https://discord.gg/", icon: <MessageSquare size={20} /> },
    { id: 5, title: "ADMIN", url: "/admin/dashboard", icon: <ShieldCheck size={20} /> }
  ];

  // We only morph on mobile AND when scrolled
  const showFloatingHamburger = isMobile && isScrolled;

  const navVariants = {
    visible: { y: 0, opacity: 1, pointerEvents: 'auto' },
    hidden: { y: -100, opacity: 0, pointerEvents: 'none' }
  };

  return (
    <>
      {/* Standard Navigation Bar (Visible on Desktop always, and on Mobile when not scrolled) */}
      <motion.div 
        variants={navVariants}
        initial="visible"
        animate={showFloatingHamburger ? "hidden" : "visible"}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', justifyContent: 'center', padding: '16px 16px 0 16px', position: 'sticky', top: 0, zIndex: 40 }}
      >
        <nav className="nav-bar">
          <div className="nav-brand">
            Bala Esports || FF TOURNAMENTS
          </div>
          <div className="nav-links">
            <Link href="/" style={{ textDecoration: 'none', color: '#059669', fontWeight: '800', fontSize: '13px' }}>HOME</Link>
            <Link href="/booking" style={{ textDecoration: 'none', color: '#D97706', fontWeight: '800', fontSize: '13px' }}>BOOKING</Link>
            <Link href="/tickets" style={{ textDecoration: 'none', color: '#E11D48', fontWeight: '800', fontSize: '13px' }}>TICKETS</Link>
            <a href="https://discord.gg/" target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#5865F2', fontWeight: '800', fontSize: '13px' }}>DISCORD</a>
            <RulesModal />
            <Link href="/admin/dashboard" style={{ textDecoration: 'none', color: '#0891B2', fontWeight: '800', fontSize: '13px', marginRight: '24px' }}>ADMIN</Link>
          </div>
          
          <LiveClock />
        </nav>
      </motion.div>

      {/* Floating Hamburger - visible when scrolled on mobile */}
      <AnimatePresence>
        {showFloatingHamburger && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="sn-floating-hamburger"
          >
            <motion.button
              onClick={toggleMenu}
              className="sn-floating-btn"
              variants={hamburgerVariants}
              animate={isScrolled ? "scrolled" : "normal"}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              <Menu size={24} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Menu Modal */}
      <AnimatePresence>
        {isMenuOpen && showFloatingHamburger && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sn-backdrop"
              onClick={toggleMenu}
            />

            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="sn-modal-container"
            >
              <div className="sn-modal-content">
                <motion.button
                  onClick={toggleMenu}
                  className="sn-close-btn"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>

                <div className="sn-menu-items">
                  {mobileMenuItems.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, x: 10 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={item.url}
                        onClick={toggleMenu}
                        className="sn-menu-item"
                        target={item.url.startsWith("http") ? "_blank" : undefined}
                      >
                        <motion.div className="sn-menu-icon" whileHover={{ rotate: 360 }} transition={{ duration: 0.3 }}>
                          {item.icon}
                        </motion.div>
                        <span className="sn-menu-text">{item.title}</span>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Rules Modal Trigger inside mobile menu */}
                  <motion.div variants={itemVariants} whileHover={{ scale: 1.05, x: 10 }} whileTap={{ scale: 0.95 }}>
                    <div className="sn-menu-item" style={{ padding: '0 16px', display: 'flex', alignItems: 'center' }}>
                      <motion.div className="sn-menu-icon" whileHover={{ rotate: 360 }} transition={{ duration: 0.3 }}>
                        <FileText size={20} />
                      </motion.div>
                      <div style={{ marginLeft: '16px', paddingTop: '4px' }}>
                         <RulesModal />
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div className="sn-deco-1" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="sn-deco-2" animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
