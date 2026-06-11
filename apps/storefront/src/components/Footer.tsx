import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { ScrollReveal } from './ScrollReveal';

const sfPro = { fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' };
const sfProDisplay = { fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' };

export const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer style={{ ...sfPro, backgroundColor: '#0d1220' }} className="text-[#5a6070] border-t border-white/5">
      <div className="max-w-[980px] mx-auto px-6 pt-16 pb-8">
        {/* Link columns — Apple dense-link: 17px / 2.41 line-height */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <ScrollReveal>
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-3 group">
                <img
                  src="/s2s-square.png"
                  alt="Space2Standard"
                  className="h-9 w-9 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <span
                  className="text-[#a0a8b8] group-hover:text-white transition-colors"
                  style={{ ...sfProDisplay, fontSize: '14px', fontWeight: 600, letterSpacing: '-0.224px' }}
                >
                  Space2Standard
                </span>
              </Link>
              <p style={{ fontSize: '12px', lineHeight: 1.43, letterSpacing: '-0.12px' }}>
                {settings.footer_tagline || 'Crafting bespoke heirloom pieces from sustainably sourced hardwoods.'}
              </p>
            </div>
          </ScrollReveal>

          {/* Navigation */}
          <ScrollReveal delay={0.1}>
            <div>
              <h3
                className="text-[#c9a46a] mb-4"
                style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.29, letterSpacing: '-0.224px' }}
              >
                Navigation
              </h3>
              <ul style={{ fontSize: '17px', lineHeight: 2.41 }}>
                {[
                  { label: 'Home', path: '/' },
                  { label: 'Products', path: '/products' },
                  { label: 'Contact', path: '/contact' },
                  { label: 'Order', path: '/order-form' },
                ].map(({ label, path }) => (
                  <li key={path}>
                    <Link to={path} className="hover:text-white transition-colors duration-150">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Contact */}
          <ScrollReveal delay={0.2}>
            <div>
              <h3
                className="text-[#c9a46a] mb-4"
                style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.29, letterSpacing: '-0.224px' }}
              >
                Contact
              </h3>
              <ul className="space-y-3" style={{ fontSize: '12px', lineHeight: 1.43, letterSpacing: '-0.12px' }}>
                <li className="flex items-start gap-2.5 hover:text-[#a0a8b8] transition-colors">
                  <MapPin size={13} className="shrink-0 mt-0.5 text-[#c9a46a]" />
                  <span>{settings.business_address || 'Windhoek, Namibia'}</span>
                </li>
                <li className="flex items-center gap-2.5 hover:text-[#a0a8b8] transition-colors">
                  <Phone size={13} className="shrink-0 text-[#c9a46a]" />
                  <span>{settings.business_phone || '+264 81 000 0000'}</span>
                </li>
                <li className="flex items-center gap-2.5 hover:text-[#a0a8b8] transition-colors">
                  <Mail size={13} className="shrink-0 text-[#c9a46a]" />
                  <span>{settings.business_email || 'hello@space2standard.com'}</span>
                </li>
              </ul>
            </div>
          </ScrollReveal>

          {/* Newsletter */}
          <ScrollReveal delay={0.3}>
            <div>
              <h3
                className="text-[#c9a46a] mb-4"
                style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.29, letterSpacing: '-0.224px' }}
              >
                Stay Connected
              </h3>
              <p className="mb-4" style={{ fontSize: '12px', lineHeight: 1.43, letterSpacing: '-0.12px' }}>
                Early access to new collections and studio stories.
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Email address"
                  style={{ ...sfPro, fontSize: '13px', padding: '8px 16px', height: '36px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '9999px', width: '100%', outline: 'none' }}
                />
                <button
                  className="btn-apple-cta self-start"
                  style={{ fontSize: '14px', padding: '8px 20px' }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Legal row */}
        <div
          className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ fontSize: '12px', lineHeight: 1.43, letterSpacing: '-0.12px', color: '#3a4050' }}
        >
          <p>Copyright &copy; 2026 Space2Standard. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#a0a8b8] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#a0a8b8] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
