import React from 'react';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex bg-charcoal-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="container mx-auto p-10 pt-16 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
};
