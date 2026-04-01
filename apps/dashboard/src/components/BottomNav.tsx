import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  Settings, 
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BottomNavProps {
  onMenuClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onMenuClick }) => {
  const navItems = [
    { name: 'Home', icon: <LayoutDashboard size={22} strokeWidth={2} />, path: '/' },
    { name: 'Orders', icon: <ShoppingCart size={22} strokeWidth={2} />, path: '/orders' },
    { name: 'Ledger', icon: <FileText size={22} strokeWidth={2} />, path: '/invoices' },
    { name: 'Config', icon: <Settings size={22} strokeWidth={2} />, path: '/settings' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy-950/90 backdrop-blur-xl border-t border-navy-800 pb-safe">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              cn(
                'flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all min-w-[64px]',
                isActive ? 'text-gold-500' : 'text-navy-500 hover:text-navy-300'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {item.icon}
                  {isActive && (
                    <motion.div 
                      layoutId="bottom-nav-indicator"
                      className="absolute -bottom-3 left-1/2 w-1 h-1 bg-gold-500 rounded-full -translate-x-1/2"
                    />
                  )}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
        
        <button 
          onClick={onMenuClick}
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all min-w-[64px] text-navy-500 hover:text-navy-300 active:scale-95"
        >
          <Menu size={22} strokeWidth={2} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Menu</span>
        </button>
      </div>
    </nav>
  );
};
