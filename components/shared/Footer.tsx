import Link from 'next/link'
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#16213e] border-t border-[#c9a84c]/10 text-[#e8d5b7] py-16">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <h2 className="text-2xl font-serif tracking-tight">Space2Standard</h2>
          <p className="text-sm opacity-70 leading-relaxed font-light">
            Luxury carpentry brand crafting bespoke furniture and installations.
            Blending traditional craftsmanship with modern design to perfection.
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="hover:text-[#c9a84c] transition opacity-70 hover:opacity-100">
              <Instagram size={20} />
            </Link>
            <Link href="#" className="hover:text-[#c9a84c] transition opacity-70 hover:opacity-100">
              <Facebook size={20} />
            </Link>
            <Link href="#" className="hover:text-[#c9a84c] transition opacity-70 hover:opacity-100">
              <Mail size={20} />
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#c9a84c]">Navigation</h3>
          <ul className="space-y-4 text-sm font-medium opacity-70">
            <li><Link href="/" className="hover:text-[#c9a84c] transition">Home</Link></li>
            <li><Link href="/products" className="hover:text-[#c9a84c] transition">Collection</Link></li>
            <li><Link href="/announcements" className="hover:text-[#c9a84c] transition">Latest News</Link></li>
            <li><Link href="/about" className="hover:text-[#c9a84c] transition">Our Story</Link></li>
            <li><Link href="/contact" className="hover:text-[#c9a84c] transition">Contact Us</Link></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#c9a84c]">Contact Details</h3>
          <ul className="space-y-4 text-sm font-medium opacity-70">
            <li className="flex items-center gap-3">
              <MapPin size={16} className="text-[#c9a84c]" />
              <span>123 Artisan Way, Craftville, CT</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-[#c9a84c]" />
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-[#c9a84c]" />
              <span>hello@space2standard.com</span>
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#c9a84c]">Newsletter</h3>
          <p className="text-sm opacity-70 font-light">Join our list for early access to new collections and exclusive offers.</p>
          <div className="flex items-center">
            <input
              type="email"
              placeholder="Your email"
              className="bg-[#0f3460] border border-[#c9a84c]/20 p-3 flex-1 text-sm text-white focus:outline-none focus:border-[#c9a84c]"
            />
            <button className="bg-[#c9a84c] text-[#1a1a2e] px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition">
              Join
            </button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-16 pt-8 border-t border-[#c9a84c]/10 text-center opacity-50 text-[10px] uppercase tracking-[0.2em] font-bold">
        &copy; {new Date().getFullYear()} Space2Standard Carpentry. All rights reserved.
      </div>
    </footer>
  )
}
