'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Megaphone,
  Settings,
  LogOut,
  ChevronRight,
  Hammer
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
  { icon: Megaphone, label: 'Announcements', href: '/admin/announcements' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-72 bg-[#16213e] border-r border-[#c9a84c]/10 flex flex-col z-[50]">
      <div className="p-10 flex items-center gap-4 border-b border-[#c9a84c]/10">
        <div className="w-10 h-10 bg-[#c9a84c] flex items-center justify-center rounded shadow-lg shadow-[#c9a84c]/20">
          <Hammer className="text-[#1a1a2e]" size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-[#e8d5b7] font-serif text-xl tracking-tight">S2S Admin</span>
          <span className="text-[8px] text-[#c9a84c] uppercase font-bold tracking-[0.3em]">Management Portal</span>
        </div>
      </div>

      <nav className="flex-1 py-12 px-6 space-y-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between p-4 rounded transition group ${
                isActive
                ? 'bg-[#c9a84c] text-[#1a1a2e] shadow-lg shadow-[#c9a84c]/10'
                : 'text-[#e8d5b7]/50 hover:bg-[#0f3460] hover:text-[#e8d5b7]'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                  {item.label}
                </span>
              </div>
              {isActive && <ChevronRight size={14} />}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-[#c9a84c]/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 text-[#e8d5b7]/40 hover:text-red-500 transition text-xs font-bold uppercase tracking-widest"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
