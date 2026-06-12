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
  X,
  Image as ImageIcon,
  MessageSquare,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  Hammer,
  Truck,
  Receipt,
  CalendarDays,
  Globe,
  Tag,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const sfDisplay = { fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' };
const sfText    = { fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' };

interface NavItem { name: string; icon: React.ReactNode; path: string; }
interface NavGroup { label: string; items: NavItem[]; }

const navGroups: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { name: 'Overview',     icon: <LayoutDashboard size={17} />, path: '/' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Orders',       icon: <ShoppingCart size={17} />,    path: '/orders' },
      { name: 'Production',   icon: <Hammer size={17} />,          path: '/production' },
      { name: 'Appointments', icon: <CalendarDays size={17} />,    path: '/appointments' },
    ],
  },
  {
    label: 'Customers',
    items: [
      { name: 'Clients',      icon: <Users size={17} />,           path: '/clients' },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { name: 'Products',     icon: <Package size={17} />,         path: '/products' },
      { name: 'Inventory',    icon: <BarChart3 size={17} />,       path: '/inventory' },
      { name: 'Categories',   icon: <Tag size={17} />,             path: '/categories' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { name: 'Invoices',     icon: <FileText size={17} />,        path: '/invoices' },
      { name: 'Suppliers',    icon: <Truck size={17} />,           path: '/suppliers' },
      { name: 'Expenses',     icon: <Receipt size={17} />,         path: '/expenses' },
    ],
  },
  {
    label: 'Website',
    items: [
      { name: 'Content',      icon: <Globe size={17} />,           path: '/content' },
      { name: 'Messages',     icon: <MessageSquare size={17} />,   path: '/messages' },
      { name: 'Gallery',      icon: <ImageIcon size={17} />,       path: '/gallery' },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Settings',     icon: <Settings size={17} />,        path: '/settings' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { signOut } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 bg-[#0d1220] border-r border-white/[0.06] flex flex-col z-50 transition-all duration-300',
          'lg:static lg:translate-x-0 lg:h-full lg:shrink-0',
          isCollapsed ? 'w-[64px]' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo header */}
        <div
          className={cn(
            'h-[60px] flex items-center border-b border-white/[0.06] shrink-0',
            isCollapsed ? 'justify-center px-3' : 'justify-between px-4',
          )}
        >
          {isCollapsed ? (
            <img src="/s2s-square.png" alt="Space2Standard" className="h-7 w-7 object-contain" />
          ) : (
            <>
              <div className="flex items-center gap-3">
                <img src="/s2s-square.png" alt="Space2Standard" className="h-8 w-8 object-contain" />
                <div>
                  <p
                    className="text-white leading-none"
                    style={{ ...sfDisplay, fontSize: '14px', fontWeight: 600, letterSpacing: '-0.2px' }}
                  >
                    Space2Standard
                  </p>
                  <p
                    className="text-[#5a6070] leading-none mt-0.5"
                    style={{ ...sfText, fontSize: '11px', letterSpacing: '-0.08px' }}
                  >
                    Admin
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden text-[#5a6070] hover:text-white transition-colors p-1"
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
              {/* Section label — hidden when collapsed */}
              {!isCollapsed && (
                <p style={{
                  ...sfText,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#3a4050',
                  padding: '0 12px',
                  marginBottom: 4,
                }}>
                  {group.label}
                </p>
              )}
              {/* Divider when collapsed */}
              {isCollapsed && gi > 0 && (
                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '6px 8px 6px' }} />
              )}

              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    title={isCollapsed ? item.name : undefined}
                    onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center rounded-lg transition-all duration-150 group',
                        isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2',
                        isActive
                          ? 'bg-[#c9a46a]/10 text-[#c9a46a]'
                          : 'text-[#6a7080] hover:text-white hover:bg-white/[0.05]',
                      )
                    }
                    style={{ ...sfText, fontSize: '13.5px', letterSpacing: '-0.2px' }}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={cn(
                            'shrink-0 transition-colors',
                            isActive ? 'text-[#c9a46a]' : 'text-[#4a5060] group-hover:text-white',
                          )}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && <span className="flex-1">{item.name}</span>}
                        {!isCollapsed && isActive && (
                          <span className="w-1 h-1 rounded-full bg-[#c9a46a]" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: collapse toggle + sign out */}
        <div className="px-2 pb-4 pt-2 border-t border-white/[0.06] space-y-1">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={cn(
                'hidden lg:flex w-full items-center rounded-lg text-[#5a6070] hover:text-white hover:bg-white/[0.05] transition-all duration-150',
                isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
              )}
              style={{ ...sfText, fontSize: '13.5px', letterSpacing: '-0.2px' }}
            >
              {isCollapsed
                ? <PanelLeftOpen size={17} className="shrink-0" />
                : <PanelLeftClose size={17} className="shrink-0" />
              }
              {!isCollapsed && <span>Collapse</span>}
            </button>
          )}

          <button
            onClick={signOut}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={cn(
              'w-full flex items-center rounded-lg text-[#ef4444]/50 hover:text-[#ef4444] hover:bg-[#ef4444]/[0.05] transition-all duration-150',
              isCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
            )}
            style={{ ...sfText, fontSize: '13.5px', letterSpacing: '-0.2px' }}
          >
            <LogOut size={17} className="shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
