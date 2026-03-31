import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-navy-950 min-h-screen text-cream-100">
      {/* Sidebar - Handles its own mobile drawer logic */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-navy-800 bg-navy-900/50 backdrop-blur-md sticky top-0 z-30">
          <h2 className="text-sm font-serif text-white tracking-widest uppercase">
            Space<span className="text-gold-500 italic">2</span>Standard
          </h2>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gold-500 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-x-hidden">
          <div className="container mx-auto p-6 md:p-10 pt-8 lg:pt-16 max-w-7xl animate-in fade-in duration-700">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
