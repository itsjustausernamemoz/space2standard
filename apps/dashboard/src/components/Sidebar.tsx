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
  X,
  Image as ImageIcon,
  MessageSquare,
  Users
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
    { name: 'Overview', icon: <LayoutDashboard size={18} />, path: '/' },
    { name: 'Products', icon: <Package size={18} />, path: '/products' },
    { name: 'Clients', icon: <Users size={18} />, path: '/clients' },
    { name: 'Image Gallery', icon: <ImageIcon size={18} />, path: '/gallery' },
    { name: 'Categories', icon: <Package size={18} />, path: '/categories' },
    { name: 'Orders', icon: <ShoppingCart size={18} />, path: '/orders' },
    { name: 'Invoices', icon: <FileText size={18} />, path: '/invoices' },
    { name: 'Inventory', icon: <BarChart3 size={18} />, path: '/inventory' },
    { name: 'Messages', icon: <MessageSquare size={18} />, path: '/messages' },
    { name: 'Settings', icon: <Settings size={18} />, path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-navy-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-navy-950 border-r border-[#ffffff0a] flex flex-col z-50 transition-transform duration-300 transform lg:relative lg:translate-x-0 outline-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-10 border-b border-[#ffffff0a] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-serif text-white tracking-widest uppercase">
              Space<span className="text-gold-500 italic">2</span>Standard
            </h2>
            <p className="text-[10px] uppercase font-bold text-navy-500 tracking-[0.2em] mt-2">Atelier Dashboard</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-navy-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-8 space-y-1.5 overflow-y-auto scrollbar-hide">
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
              <span className="group-hover:scale-110 transition-transform opacity-70 group-hover:opacity-100">{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              <ChevronRight size={12} className={cn(
                "transition-all duration-300 opacity-0 group-hover:opacity-40 group-hover:translate-x-1"
              )} />
            </NavLink>
          ))}
        </nav>

        <div className="p-8 border-t border-[#ffffff0a]">
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[4px] text-[10px] font-bold uppercase tracking-widest text-[#ef4444]/60 hover:text-[#ef4444] hover:bg-[#ef4444]/5 transition-all"
          >
            <LogOut size={18} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
