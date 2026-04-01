import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-navy-950 min-h-screen text-cream-100">
      {/* Sidebar - Desktop logic and Mobile Drawer */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (Branding only) */}
        <div className="lg:hidden flex items-center justify-center p-4 border-b border-navy-800 bg-navy-900/50 backdrop-blur-md sticky top-0 z-30">
          <h2 className="text-sm font-serif text-white tracking-widest uppercase">
            Space<span className="text-gold-500 italic">2</span>Standard
          </h2>
        </div>

        <div className="flex-1 overflow-x-hidden pb-24 lg:pb-0">
          <div className="container mx-auto p-6 md:p-10 pt-8 lg:pt-16 max-w-7xl animate-in fade-in duration-700">
            {children}
          </div>
        </div>

        {/* Mobile Native Bottom Navigation */}
        <BottomNav onMenuClick={() => setIsSidebarOpen(true)} />
      </main>
    </div>
  );
};
