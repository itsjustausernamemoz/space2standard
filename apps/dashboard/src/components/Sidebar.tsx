import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { signOut } = useAuth();

  const menuItems = [
    { name: 'Overview', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Products', icon: <Package size={20} />, path: '/products' },
    { name: 'Orders', icon: <ShoppingCart size={20} />, path: '/orders' },
    { name: 'Invoices', icon: <FileText size={20} />, path: '/invoices' },
    { name: 'Inventory', icon: <BarChart3 size={20} />, path: '/inventory' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-navy-900 border-r border-navy-800 flex flex-col z-50 transition-transform duration-300 transform lg:relative lg:translate-x-0 outline-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b border-navy-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-serif text-white tracking-widest uppercase">
              Space<span className="text-gold-500 italic">2</span>Standard
            </h2>
            <p className="text-[10px] uppercase font-bold text-navy-500 tracking-[0.2em] mt-2">Admin Portal</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-navy-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) => 
                cn(
                  'sidebar-link group',
                  isActive ? 'sidebar-link-active' : 'text-navy-400'
                )
              }
            >
              <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              <ChevronRight size={14} className={cn(
                "transition-all duration-300",
                "opacity-0 group-hover:opacity-40 group-hover:translate-x-1"
              )} />
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-navy-800">
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-error/70 hover:text-error hover:bg-error/10 transition-all active:scale-95"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
