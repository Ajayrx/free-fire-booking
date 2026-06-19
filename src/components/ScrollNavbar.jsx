"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Home, Trophy, LayoutDashboard, Shield, User } from "lucide-react";
import Link from "next/link";
import "./ScrollNavbar.css";

const defaultMenuItems = [
  {
    id: 1,
    title: "Home",
    url: "/",
    icon: <Home size={20} />
  },
  {
    id: 2,
    title: "Tournaments",
    url: "/",
    icon: <Trophy size={20} />
  },
  {
    id: 3,
    title: "Dashboard",
    url: "/",
    icon: <LayoutDashboard size={20} />
  },
  {
    id: 4,
    title: "Admin",
    url: "/admin",
    icon: <Shield size={20} />
  }
];

export function ScrollNavbar({ 
  menuItems = defaultMenuItems
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 100);
  });

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const menuVariants = {
    closed: {
      opacity: 0,
      scale: 0.8,
      y: -50,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: {
      y: 20,
      opacity: 0,
      scale: 0.8
    },
    open: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const hamburgerVariants = {
    normal: { rotate: 0, scale: 1 },
    scrolled: { rotate: 360, scale: 1.1 }
  };

  return (
    <>
      {/* Full Navbar - visible when not scrolled */}
      <motion.nav
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: isScrolled ? -100 : 0,
          opacity: isScrolled ? 0 : 1
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="sn-nav"
      >
        <div className="sn-container">
          <div className="sn-flex-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/" className="sn-logo">
                <span className="text-white">FINAL</span>
                <span className="text-gradient">CIRCLE</span>
              </Link>
            </motion.div>

            {/* Desktop Menu */}
            <div className="sn-desktop-menu">
              <div className="sn-nav-links">
                {menuItems.map((item) => (
                  <motion.div
                    key={item.id}
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href={item.url} className="sn-nav-link">
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                    {hoveredItem === item.id && (
                      <motion.div
                        layoutId="navbar-hover"
                        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px', zIndex: -1 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Existing Login Button */}
              <div style={{ marginLeft: '24px', display: 'flex', alignItems: 'center' }}>
                <button className="sn-login-btn">
                  <User size={16} />
                  <span>Login</span>
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="sn-mobile-btn-container">
              <motion.button
                onClick={toggleMenu}
                className="sn-mobile-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Menu size={24} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Floating Hamburger - visible when scrolled */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isScrolled ? 1 : 0,
          opacity: isScrolled ? 1 : 0
        }}
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

      {/* Floating Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sn-backdrop"
              onClick={toggleMenu}
            />

            {/* Menu Container */}
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="sn-modal-container"
            >
              <div className="sn-modal-content">
                {/* Close Button */}
                <motion.button
                  onClick={toggleMenu}
                  className="sn-close-btn"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>

                {/* Menu Items */}
                <div className="sn-menu-items">
                  {menuItems.map((item) => (
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
                      >
                        <motion.div
                          className="sn-menu-icon"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          {item.icon}
                        </motion.div>
                        <span className="sn-menu-text">
                          {item.title}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Login inside mobile menu */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button
                      onClick={toggleMenu}
                      className="sn-mobile-login"
                    >
                      <User size={20} />
                      <span>Login</span>
                    </button>
                  </motion.div>
                </div>

                {/* Decorative Elements */}
                <motion.div
                  className="sn-deco-1"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="sn-deco-2"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
