import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

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
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
      isScrolled ? 'bg-navy-950/90 backdrop-blur-md shadow-lg py-4 border-b border-white/5' : 'bg-transparent py-6'
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-serif text-white tracking-tighter hover:text-gold-500 transition-all">
          Space<span className="text-gold-500 italic">2</span>Standard
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
          
          <Link to="/products">
            <Button size="sm" variant="primary" className="bg-gold-600 hover:bg-gold-500 text-white rounded-lg px-6">
              Commission
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
            className="text-3xl font-serif text-white hover:text-gold-500 transition-all"
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <Link to="/products" onClick={() => setIsOpen(false)}>
          <Button size="lg" variant="primary" className="bg-gold-600 px-12 py-6 rounded-xl text-white">
            Begin Commission
          </Button>
        </Link>
      </div>
    </nav>
  );
};
