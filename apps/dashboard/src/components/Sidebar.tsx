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
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
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
    <aside className="w-72 h-screen bg-charcoal-900 border-r border-charcoal-800 flex flex-col sticky top-0 overflow-y-auto">
      <div className="p-8 border-b border-charcoal-800">
        <h2 className="text-xl font-serif text-white tracking-widest uppercase">
          Space<span className="text-gold-500 italic">2</span>Standard
        </h2>
        <p className="text-[10px] uppercase font-bold text-charcoal-600 tracking-[0.2em] mt-2">Admin Panel</p>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              cn(
                'sidebar-link group',
                isActive ? 'sidebar-link-active' : 'text-charcoal-500'
              )
            }
          >
            <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="flex-1">{item.name}</span>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-charcoal-800">
        <button 
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
