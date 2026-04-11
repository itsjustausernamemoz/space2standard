import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '../contexts/SettingsContext';
import { useCart } from '../contexts/CartContext';
import { useStorefrontAuth } from '../contexts/StorefrontAuthContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();
  const { itemCount, setIsCartOpen } = useCart();
  const { user, profile, signOut } = useStorefrontAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[56px] flex items-center',
      isScrolled 
        ? 'bg-[#060b18] border-b border-white/10' 
        : 'bg-transparent'
    )}>
      <div className="container mx-auto px-6 flex items-center h-full">
        {/* Logo Left */}
        <div className="flex-1 flex items-center">
          <Link to="/" className="text-xl font-serif text-white tracking-tighter transition-all flex items-center">
            {settings.business_logo_url ? (
              <img src={settings.business_logo_url} alt={settings.business_name} className="h-6 max-w-[140px] object-contain" />
            ) : (
              <span className="flex items-center gap-1">
                Space<span className="text-gold">2</span>Standard
              </span>
            )}
          </Link>
        </div>

        {/* Desktop Nav Centered */}
        <div className="hidden md:flex items-center justify-center gap-10 flex-[2]">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                'text-[10px] font-medium uppercase tracking-[0.2em] transition-all hover:text-white',
                location.pathname === link.path ? 'text-white' : 'text-[#a0a8b8]'
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>
        
        {/* Actions Right */}
        <div className="flex-1 flex items-center justify-end gap-6">
          {/* Expanding Search */}
          <div className="flex items-center">
            <div className={cn(
              "overflow-hidden transition-all duration-300 flex items-center",
              isSearchOpen ? "w-40 opacity-100" : "w-0 opacity-0"
            )}>
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none text-white text-[11px] focus:outline-none w-full"
                autoFocus={isSearchOpen}
              />
            </div>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-[#a0a8b8] hover:text-white transition-colors"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
          </div>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative text-[#a0a8b8] hover:text-white transition-colors"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gold text-[#060b18] text-[8px] font-bold flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </button>

          {user ? (
            <Link to="/settings" className="text-[#a0a8b8] hover:text-white transition-colors">
              <User size={18} strokeWidth={1.5} />
            </Link>
          ) : (
            <Link to="/auth" className="text-[#a0a8b8] hover:text-white transition-colors">
              <User size={18} strokeWidth={1.5} />
            </Link>
          )}

          <Link to="/products" className="hidden md:block">
            <button className="px-5 py-1.5 border border-white text-white rounded-[4px] text-[11px] font-medium uppercase tracking-[0.12em] transition-all hover:bg-white hover:text-[#060b18]">
              Order
            </button>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-[#a0a8b8] hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        'fixed inset-0 bg-[#060b18] z-[60] flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden',
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      )}>
        <button 
          className="absolute top-6 right-6 text-[#a0a8b8] hover:text-white"
          onClick={() => setIsOpen(false)}
        >
          <X size={24} />
        </button>
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="text-4xl font-serif text-white hover:text-gold transition-all"
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <Link to="/products" onClick={() => setIsOpen(false)}>
          <button className="px-8 py-3 border border-white text-white rounded-[4px] text-[13px] font-medium uppercase tracking-[0.15em]">
            Order Now
          </button>
        </Link>
      </div>
    </nav>
  );
};

