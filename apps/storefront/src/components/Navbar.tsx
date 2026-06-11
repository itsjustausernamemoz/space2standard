import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '../contexts/CartContext';
import { useStorefrontAuth } from '../contexts/StorefrontAuthContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { itemCount, setIsCartOpen } = useCart();
  const { user } = useStorefrontAuth();

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Global Nav — Apple-style: true black, 44px, SF Pro 12px */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[44px] flex items-center bg-[#000000]">
        <div className="w-full max-w-[1440px] mx-auto px-6 flex items-center h-full gap-6">

          {/* Logo — left */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 mr-auto">
            <img
              src="/s2s-square.png"
              alt="Space2Standard"
              className="h-[26px] w-[26px] object-contain"
            />
            <span
              className="hidden sm:block text-white font-semibold leading-none"
              style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif', fontSize: '14px', letterSpacing: '-0.2px' }}
            >
              Space2Standard
            </span>
          </Link>

          {/* Desktop Nav — centered */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'transition-colors duration-150',
                  location.pathname === link.path ? 'text-white' : 'text-white/70 hover:text-white'
                )}
                style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif', fontSize: '12px', letterSpacing: '-0.12px' }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions — right */}
          <div className="flex items-center gap-5 ml-auto">
            {/* Expanding search */}
            <div className="flex items-center gap-2">
              <div className={cn(
                'overflow-hidden transition-all duration-300 flex items-center',
                isSearchOpen ? 'w-36 opacity-100' : 'w-0 opacity-0'
              )}>
                <input
                  type="text"
                  placeholder="Search…"
                  className="bg-transparent border-none text-white text-[11px] focus:outline-none w-full placeholder-white/40"
                  autoFocus={isSearchOpen}
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Search"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-white/70 hover:text-white transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-[14px] h-[14px] bg-[#c9a46a] text-[#000] text-[8px] font-bold flex items-center justify-center rounded-full leading-none">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Account */}
            <Link
              to={user ? '/settings' : '/auth'}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Account"
            >
              <User size={16} strokeWidth={1.5} />
            </Link>

            {/* Primary CTA — pill */}
            <Link to="/products" className="hidden md:block">
              <button
                className="px-[18px] py-[7px] bg-[#c9a46a] text-[#000] rounded-full font-medium transition-colors hover:bg-white active:scale-95"
                style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif', fontSize: '12px', letterSpacing: '-0.12px' }}
              >
                Order
              </button>
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white/70 hover:text-white transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div className={cn(
        'fixed inset-0 bg-[#000] z-[60] flex flex-col items-center justify-center gap-10 transition-all duration-500 md:hidden',
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      )}>
        <button
          className="absolute top-4 right-6 text-white/60 hover:text-white"
          onClick={() => setIsOpen(false)}
        >
          <X size={22} />
        </button>

        {/* Logo in mobile overlay */}
        <img src="/s2s-square.png" alt="Space2Standard" className="h-14 w-14 object-contain mb-4" />

        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="text-white hover:text-[#c9a46a] transition-colors"
            style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif', fontSize: '34px', fontWeight: 600, letterSpacing: '-0.374px' }}
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </Link>
        ))}

        <Link to="/products" onClick={() => setIsOpen(false)}>
          <button className="mt-4 px-8 py-3 bg-[#c9a46a] text-[#000] rounded-full font-medium active:scale-95 transition-transform"
            style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif', fontSize: '17px' }}>
            Order Now
          </button>
        </Link>
      </div>
    </>
  );
};
