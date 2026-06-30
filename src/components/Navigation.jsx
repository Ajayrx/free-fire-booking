"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
const LiveClock = dynamic(() => import("@/components/LiveClock"), { ssr: false });
const RulesModal = dynamic(() => import("@/components/RulesModal"), { ssr: false });
const FloatingMobileMenu = dynamic(() => import("@/components/FloatingMobileMenu"), { ssr: false });
import "./ScrollNavbar.css";

export default function Navigation() {
  const [hideTopNav, setHideTopNav] = useState(false);

  return (
    <>
      {/* Standard Navigation Bar */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          padding: '16px 16px 0 16px', 
          position: 'sticky', 
          top: 0, 
          zIndex: 1000,
          transform: hideTopNav ? 'translateY(-120%)' : 'translateY(0)',
          opacity: hideTopNav ? 0 : 1,
          pointerEvents: hideTopNav ? 'none' : 'auto',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
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
      </div>

      <FloatingMobileMenu onScrolledChange={(scrolled) => setHideTopNav(scrolled)} />
    </>
  );
}
