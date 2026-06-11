import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { NotificationPanel } from './NotificationPanel';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex bg-navy-950 h-screen overflow-hidden text-cream-100">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((c) => !c)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile sticky header */}
        <div className="lg:hidden flex items-center justify-between px-4 h-[44px] shrink-0 border-b border-white/[0.06] bg-[#0d1220]/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-2.5">
            <img src="/s2s-square.png" alt="Space2Standard" className="h-7 w-7 object-contain" />
            <span
              className="text-white"
              style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif', fontSize: '14px', fontWeight: 600, letterSpacing: '-0.2px' }}
            >
              Space2Standard
            </span>
          </div>
          <NotificationPanel />
        </div>

        {/* Only this div scrolls — sidebar stays put */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 lg:pb-0 relative">
          <div className="hidden lg:block absolute top-8 right-10 z-40">
            <NotificationPanel />
          </div>
          <div className="container mx-auto p-6 md:p-10 pt-8 lg:pt-16 max-w-7xl animate-in fade-in duration-700">
            {children}
          </div>
        </div>

        <BottomNav onMenuClick={() => setIsSidebarOpen(true)} />
      </main>
    </div>
  );
};
