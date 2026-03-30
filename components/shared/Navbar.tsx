'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import { CartDrawer } from './CartDrawer'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { totalItems } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#1a1a2e]/90 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif text-[#e8d5b7] tracking-tight">
            Space2Standard
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 uppercase text-xs tracking-widest font-semibold text-[#e8d5b7]">
            <Link href="/products" className="hover:text-[#c9a84c] transition">Products</Link>
            <Link href="/announcements" className="hover:text-[#c9a84c] transition">Announcements</Link>
            <Link href="/about" className="hover:text-[#c9a84c] transition">About</Link>
            <Link href="/contact" className="hover:text-[#c9a84c] transition">Contact</Link>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-[#e8d5b7] hover:text-[#c9a84c] transition"
            >
              <ShoppingCart size={24} />
              {totalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c9a84c] text-[#1a1a2e] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems()}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-[#e8d5b7] focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#1a1a2e] border-t border-[#c9a84c]/20 p-6 flex flex-col space-y-6 text-[#e8d5b7] uppercase text-sm tracking-widest animate-in fade-in slide-in-from-top-4 duration-300">
            <Link href="/products" onClick={() => setIsOpen(false)}>Products</Link>
            <Link href="/announcements" onClick={() => setIsOpen(false)}>Announcements</Link>
            <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
          </div>
        )}
      </nav>
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
