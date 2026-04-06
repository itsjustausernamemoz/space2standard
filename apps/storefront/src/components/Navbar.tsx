import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';
import { useSettings } from '../contexts/SettingsContext';
import { useCart } from '../contexts/CartContext';
import { useStorefrontAuth } from '../contexts/StorefrontAuthContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();
  const { itemCount, setIsCartOpen } = useCart();
  const { user, profile, signOut } = useStorefrontAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
      isScrolled ? 'bg-navy-950/90 backdrop-blur-md shadow-lg py-4 border-b border-white/5' : 'bg-transparent py-6'
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-serif text-navy-300 tracking-tighter hover:text-gold-500 transition-all flex items-center">
          {settings.business_logo_url ? (
            <img src={settings.business_logo_url} alt={settings.business_name} className="h-10 max-w-[200px] object-contain" />
          ) : (
            <>{settings.business_name || "Space2Standard"}</>
          )}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-12">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'text-[10px] font-bold uppercase tracking-[0.25em] transition-all hover:text-gold-500',
                  location.pathname === link.path ? 'text-gold-500' : 'text-navy-400'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-6 border-l border-white/10 pl-6">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-navy-400 hover:text-gold-500 transition-colors"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-error text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-navy-950">
                  {itemCount}
                </span>
              )}
            </button>
            {user ? (
              <div className="group relative">
                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-navy-400 hover:text-gold-500 transition-colors">
                  <User size={16} />
                  <span>{profile?.full_name?.split(' ')[0] || 'Account'}</span>
                </button>
                <div className="absolute top-full right-0 mt-4 bg-navy-900 border border-gold-500/20 rounded-xl p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-32">
                   <Link to="/settings" className="block w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-navy-400 hover:bg-gold-500/10 hover:text-gold-500 rounded-lg">Settings</Link>
                   <button onClick={signOut} className="block w-full text-left px-4 py-2 mt-1 text-xs font-bold uppercase tracking-widest text-error hover:bg-error/10 rounded-lg">Sign Out</button>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="text-navy-400 hover:text-gold-500 transition-colors" title="Sign In">
                <User size={20} />
              </Link>
            )}
            <Link to="/products">
              <Button size="sm" variant="primary" className="bg-gold-600 hover:bg-gold-500 text-navy-950 rounded-lg px-6">
                Order
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Toggle & Cart */}
        <div className="flex items-center gap-4 md:hidden">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative text-navy-300 hover:text-gold-500 transition-colors"
          >
            <ShoppingBag size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-error text-white text-[9px] font-bold flex items-center justify-center rounded-full border border-navy-950">
                {itemCount}
              </span>
            )}
          </button>
          {user ? (
            <Link to="/settings" className="text-navy-300 hover:text-gold-500 transition-colors">
               <User size={22} />
            </Link>
          ) : (
            <Link to="/auth" className="text-navy-300 hover:text-gold-500 transition-colors">
               <User size={22} />
            </Link>
          )}
          <button 
            className="text-navy-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        'fixed inset-0 bg-navy-950 z-40 flex flex-col items-center justify-center gap-10 transition-all duration-500 md:hidden',
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      )}>
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="text-3xl font-serif text-navy-300 hover:text-gold-500 transition-all"
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <Link to="/products" onClick={() => setIsOpen(false)}>
          <Button size="lg" variant="primary" className="bg-gold-600 px-12 py-6 rounded-xl text-navy-950">
            Begin Order
          </Button>
        </Link>
      </div>
    </nav>
  );
};
