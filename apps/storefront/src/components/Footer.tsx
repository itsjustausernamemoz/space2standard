import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-walnut-800 text-gold-300 py-24 pb-12">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="space-y-8">
          <Link to="/" className="text-3xl font-serif tracking-tighter hover:text-gold-500 transition-colors">
            Space<span className="text-gold-500 italic">2</span>Standard
          </Link>
          <p className="text-sm opacity-70 leading-relaxed font-light">
            Luxury carpentry brand crafting bespoke furniture and installations.
            Blending traditional craftsmanship with modern design to perfection.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-gold-500 transition opacity-80 hover:opacity-100"><Instagram size={24} strokeWidth={1.5} /></a>
            <a href="#" className="hover:text-gold-500 transition opacity-80 hover:opacity-100"><Facebook size={24} strokeWidth={1.5} /></a>
            <a href="#" className="hover:text-gold-500 transition opacity-80 hover:opacity-100"><Mail size={24} strokeWidth={1.5} /></a>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gold-500">Navigation</h3>
          <ul className="space-y-4 text-sm font-medium opacity-70">
            <li><Link to="/" className="hover:text-gold-500 transition">Home</Link></li>
            <li><Link to="/products" className="hover:text-gold-500 transition">Collection</Link></li>
            <li><Link to="/about" className="hover:text-gold-500 transition">Our Story</Link></li>
            <li><Link to="/contact" className="hover:text-gold-500 transition">Contact Us</Link></li>
          </ul>
        </div>

        <div className="space-y-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gold-500">Contact Details</h3>
          <ul className="space-y-6 text-sm font-medium opacity-70">
            <li className="flex items-center gap-4"><MapPin size={18} className="text-gold-500" strokeWidth={1.5} /><span>123 Artisan Way, Craftville, CT</span></li>
            <li className="flex items-center gap-4"><Phone size={18} className="text-gold-500" strokeWidth={1.5} /><span>+1 (555) 123-4567</span></li>
            <li className="flex items-center gap-4"><Mail size={18} className="text-gold-500" strokeWidth={1.5} /><span>hello@space2standard.com</span></li>
          </ul>
        </div>

        <div className="space-y-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-gold-500">Newsletter</h3>
          <p className="text-sm opacity-70 font-light">Join our list for early access to new collections and exclusive offers.</p>
          <div className="flex items-center relative">
            <input
              type="email"
              placeholder="Your email"
              className="bg-walnut-900 border-none outline-none p-4 pr-24 w-full text-sm text-gold-300 placeholder:text-gold-300/30"
            />
            <button className="absolute right-2 text-xs font-bold uppercase tracking-widest text-gold-500 hover:text-gold-400 transition">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-24 pt-12 border-t border-gold-500/10 text-center opacity-40 text-[10px] uppercase tracking-[0.3em] font-bold">
        &copy; {new Date().getFullYear()} Space2Standard Carpentry. Crafted for life.
      </div>
    </footer>
  );
};
