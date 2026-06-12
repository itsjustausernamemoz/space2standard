import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2, Star, Megaphone, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ui/ProductCard';
import { ScrollReveal } from '../components/ScrollReveal';

interface Announcement {
  id: string;
  title: string;
  body: string | null;
  type: 'info' | 'promo' | 'alert' | 'news';
  cta_label: string | null;
  cta_url: string | null;
  expires_at: string | null;
}

interface Testimonial {
  id: string;
  client_name: string;
  client_role: string | null;
  quote: string;
  rating: number;
}

const TYPE_STYLES: Record<string, { bg: string; border: string; badge: string; badgeBg: string; label: string }> = {
  info:  { bg: 'rgba(59,130,246,0.06)',  border: 'rgba(59,130,246,0.2)',  badge: '#60a5fa', badgeBg: 'rgba(59,130,246,0.15)',  label: 'Info'  },
  promo: { bg: 'rgba(201,164,106,0.06)', border: 'rgba(201,164,106,0.2)', badge: '#c9a46a', badgeBg: 'rgba(201,164,106,0.15)', label: 'Promo' },
  alert: { bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.2)',   badge: '#f87171', badgeBg: 'rgba(239,68,68,0.15)',   label: 'Alert' },
  news:  { bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.2)',  badge: '#34d399', badgeBg: 'rgba(16,185,129,0.15)',  label: 'News'  },
};

const sfDisplay = { fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' };
const sfText    = { fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' };

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = React.useState<any[]>([]);
  const [vatRate, setVatRate]                   = React.useState(15);
  const [loading, setLoading]                   = React.useState(true);
  const [content, setContent]                   = React.useState<Record<string, string>>({});
  const [announcements, setAnnouncements]       = React.useState<Announcement[]>([]);
  const [testimonials, setTestimonials]         = React.useState<Testimonial[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      const [pRes, sRes, cRes, aRes, tRes] = await Promise.all([
        supabase.from('products').select('*, images:product_images(*), product_reviews(*)').eq('is_published', true).limit(3),
        supabase.from('settings').select('*'),
        supabase.from('site_content').select('key, value'),
        supabase.from('announcements').select('id, title, body, type, cta_label, cta_url, expires_at').eq('is_active', true),
        supabase.from('testimonials').select('id, client_name, client_role, quote, rating').eq('is_active', true).eq('is_featured', true).order('sort_order').limit(3),
      ]);

      if (pRes.data) setFeaturedProducts(pRes.data);

      const vRate = sRes.data?.find((s: any) => s.key === 'vat_rate')?.value;
      if (vRate) setVatRate(parseFloat(vRate));

      if (cRes.data) {
        const map: Record<string, string> = {};
        cRes.data.forEach((r: any) => { map[r.key] = r.value ?? ''; });
        setContent(map);
      }

      if (aRes.data) {
        const now = new Date();
        setAnnouncements(aRes.data.filter((a: any) => !a.expires_at || new Date(a.expires_at) > now));
      }

      if (tRes.data) setTestimonials(tRes.data);

      setLoading(false);
    }
    fetchData();
  }, []);

  const get = (key: string, fallback: string) => content[key] || fallback;

  const artisanBlocks = [
    { title: get('artisan_block_1_title', 'Sustainably Sourced'), desc: get('artisan_block_1_desc', 'We only use premium hardwoods from Namibian forests.') },
    { title: get('artisan_block_2_title', 'Hand-Rubbed Finishes'), desc: get('artisan_block_2_desc', 'Natural oils and waxes that age gracefully over decades.') },
    { title: get('artisan_block_3_title', 'Bespoke Engineering'), desc: get('artisan_block_3_desc', 'Intricate joinery that removes the need for visible fasteners.') },
  ];

  return (
    <div className="flex flex-col bg-[#060b18]">

      {/* Announcements */}
      {announcements.length > 0 && (
        <section style={{ paddingTop: 60, paddingBottom: 0 }} className="container mx-auto px-6">
          <div className="space-y-3 pt-6">
            {announcements.map(ann => {
              const s = TYPE_STYLES[ann.type] ?? TYPE_STYLES.info;
              return (
                <div key={ann.id} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: s.badgeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Megaphone size={15} color={s.badge} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: ann.body ? 4 : 0, flexWrap: 'wrap' }}>
                      <span style={{ ...sfText, color: s.badge, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: s.badgeBg, padding: '2px 8px', borderRadius: 6 }}>{s.label}</span>
                      <span style={{ ...sfText, color: '#fff', fontSize: 14, fontWeight: 600 }}>{ann.title}</span>
                    </div>
                    {ann.body && <p style={{ ...sfText, color: '#8a9ab0', fontSize: 13, lineHeight: 1.5 }}>{ann.body}</p>}
                  </div>
                  {ann.cta_label && ann.cta_url && (
                    <a href={ann.cta_url} style={{ display: 'flex', alignItems: 'center', gap: 6, color: s.badge, fontSize: 13, fontWeight: 600, textDecoration: 'none', flexShrink: 0, ...sfText }}>
                      {ann.cta_label} <ArrowRight size={13} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/images/hero_lux.png"
            alt="Artisan Carpentry Workshop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060b18]/80 via-transparent to-[#060b18]" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-32">
          <ScrollReveal>
            <div className="space-y-8">
              <span style={{ ...sfText, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#c9a46a', textTransform: 'uppercase' }}>
                {get('hero_eyebrow', 'Excellence in Craftsmanship')}
              </span>
              <h1
                className="text-white"
                style={{ ...sfDisplay, fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: 600, lineHeight: 1.07, letterSpacing: '-0.28px' }}
              >
                Space<span className="text-[#c9a46a]">2</span>Standard
              </h1>
              <p
                className="text-[#a0a8b8] max-w-2xl mx-auto"
                style={{ ...sfDisplay, fontSize: '28px', fontWeight: 400, lineHeight: 1.14, letterSpacing: '0.196px' }}
              >
                {get('hero_tagline', 'Bespoke furniture crafted to your vision.')}
                <br className="hidden md:inline" />
                {get('hero_subtext', 'Built to last generations.')}
              </p>
              <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/products">
                  <button className="btn-apple-hero">{get('hero_cta_primary', 'Order a Piece')}</button>
                </Link>
                <Link to="/products">
                  <button className="btn-apple-outline" style={{ color: '#c9a46a', borderColor: '#c9a46a', fontSize: '18px', fontWeight: 300 }}>
                    {get('hero_cta_secondary', 'Explore Collection')}
                  </button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-[160px] px-6 container mx-auto">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-32">
            <div className="space-y-6 text-center md:text-left">
              <span style={{ ...sfText, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#c9a46a', textTransform: 'uppercase' }}>
                {get('featured_eyebrow', 'Our Masterpieces')}
              </span>
              <h2
                className="text-white"
                style={{ ...sfDisplay, fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 600, lineHeight: 1.07, letterSpacing: '-0.28px' }}
              >
                {get('featured_heading', 'Featured Collection')}
              </h2>
            </div>
            <Link to="/products" className="group flex items-center gap-3 text-[#c9a46a] uppercase text-[11px] font-bold tracking-[0.2em] border-b border-[#c9a46a]/20 hover:border-[#c9a46a] transition-all pb-2">
              Browse All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[1,2,3].map(i => (
              <div key={i} className="aspect-square bg-white/[0.03] animate-pulse rounded-[6px]" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} vatRate={vatRate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 grayscale opacity-40">
            <p className="text-[#a0a8b8] italic font-light">High-quality product photography coming soon from our artisans in Windhoek.</p>
          </div>
        )}
      </section>

      {/* Trust / Process Section */}
      <section className="py-[160px] bg-[#060b18] border-y border-white/5 relative overflow-hidden">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-32 items-center">
          <ScrollReveal>
            <div className="space-y-16">
              <div className="space-y-8">
                <span style={{ ...sfText, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#c9a46a', textTransform: 'uppercase' }}>
                  {get('artisan_eyebrow', 'The Artisan Way')}
                </span>
                <h2
                  className="text-white"
                  style={{ ...sfDisplay, fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 600, lineHeight: 1.07, letterSpacing: '-0.28px' }}
                >
                  {get('artisan_heading', 'From Tree\nto Table').split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>{line}{i < arr.length - 1 && <br />}</React.Fragment>
                  ))}
                </h2>
                <p className="text-[17px] font-light leading-[1.8] text-[#a0a8b8] max-w-xl">
                  {get('artisan_body', "At Space2Standard, we don't just build furniture; we curate masterpieces. Our process combines ancient woodworking techniques with modern precision to create pieces that are as functional as they are beautiful.")}
                </p>
              </div>

              <div className="space-y-12">
                {artisanBlocks.map((item, idx) => (
                  <div key={idx} className="flex gap-8 items-start">
                    <div className="w-10 h-10 rounded-full border border-[#c9a46a]/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="text-[#c9a46a]" size={16} />
                    </div>
                    <div className="space-y-2">
                      <h3
                        className="text-white"
                        style={{ ...sfDisplay, fontSize: '21px', fontWeight: 600, lineHeight: 1.19, letterSpacing: '0.231px' }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-[13px] font-light text-[#a0a8b8] leading-relaxed italic">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="relative">
              <div className="aspect-square relative rounded-[6px] overflow-hidden border border-white/10 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#060b18]/60 to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1581429035334-080b4334313f?q=80&w=2670&auto=format&fit=crop"
                  alt="Wood grain texture"
                  className="w-full h-full object-cover grayscale opacity-60 transition-transform duration-[2s] group-hover:scale-110"
                />
                {testimonials.length > 0 ? (
                  <div className="absolute bottom-12 left-12 z-20 space-y-6">
                    <div className="flex gap-1 text-[#c9a46a]">
                      {Array.from({ length: testimonials[0].rating }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <p className="text-2xl font-serif italic text-white leading-tight">
                      "{testimonials[0].quote}"
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a46a] font-bold">
                      — {testimonials[0].client_name}{testimonials[0].client_role ? `, ${testimonials[0].client_role}` : ''}
                    </p>
                  </div>
                ) : (
                  <div className="absolute bottom-12 left-12 z-20 space-y-6">
                    <div className="flex gap-1 text-[#c9a46a]">
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <p className="text-2xl font-serif italic text-white leading-tight">
                      "Exceeded all my expectations. <br/> A true heirloom."
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a46a] font-bold">
                      — Marc J. Kapstadt
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials (if 2+ featured) */}
      {testimonials.length >= 2 && (
        <section className="py-[120px] container mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20 space-y-4">
              <span style={{ ...sfText, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#c9a46a', textTransform: 'uppercase' }}>Client Stories</span>
              <h2 style={{ ...sfDisplay, color: '#fff', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.28px' }}>What Our Clients Say</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.id} delay={i * 0.1}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                    {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={13} color="#c9a46a" fill="#c9a46a" />)}
                  </div>
                  <p style={{ ...sfText, color: '#a0a8b8', fontSize: 15, fontStyle: 'italic', lineHeight: 1.65, marginBottom: 20 }}>"{t.quote}"</p>
                  <div>
                    <p style={{ ...sfText, color: '#fff', fontSize: 13, fontWeight: 600 }}>{t.client_name}</p>
                    {t.client_role && <p style={{ ...sfText, color: '#5a6070', fontSize: 12 }}>{t.client_role}</p>}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* FAQ teaser */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} className="py-[80px] container mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p style={{ ...sfText, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#c9a46a', textTransform: 'uppercase', marginBottom: 8 }}>Got Questions?</p>
              <h3 style={{ ...sfDisplay, color: '#fff', fontSize: 28, fontWeight: 600, letterSpacing: '-0.28px' }}>Visit our FAQ page</h3>
              <p style={{ ...sfText, color: '#6a7080', fontSize: 14, marginTop: 6 }}>Everything about bespoke furniture, ordering and delivery.</p>
            </div>
            <Link to="/faqs">
              <button style={{ ...sfText, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(201,164,106,0.1)', border: '1px solid rgba(201,164,106,0.25)', borderRadius: 999, padding: '12px 24px', color: '#c9a46a', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                View FAQs <ChevronRight size={15} />
              </button>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};
