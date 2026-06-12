import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Megaphone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ui/ProductCard';

interface Announcement {
  id: string;
  title: string;
  body: string | null;
  type: 'info' | 'promo' | 'alert' | 'news';
  cta_label: string | null;
  cta_url: string | null;
  discount_percent: number | null;
  expires_at: string | null;
  announcement_products?: { product_id: string }[];
}

const PromoCountdown: React.FC<{ expiresAt: string; onExpired: () => void }> = ({ expiresAt, onExpired }) => {
  const [label, setLabel] = React.useState('');
  const firedRef = React.useRef(false);
  React.useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setLabel('Ended');
        if (!firedRef.current) { firedRef.current = true; onExpired(); }
        return;
      }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setLabel(d > 0
        ? `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
        : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [expiresAt, onExpired]);
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{label}</span>;
};

const TYPE_STYLES: Record<string, { bg: string; border: string; badge: string; badgeBg: string; label: string }> = {
  info:  { bg: 'rgba(59,130,246,0.06)',  border: 'rgba(59,130,246,0.18)',  badge: '#60a5fa', badgeBg: 'rgba(59,130,246,0.12)',  label: 'Info'  },
  promo: { bg: 'rgba(201,164,106,0.06)', border: 'rgba(201,164,106,0.18)', badge: '#c9a46a', badgeBg: 'rgba(201,164,106,0.12)', label: 'Promo' },
  alert: { bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.18)',   badge: '#f87171', badgeBg: 'rgba(239,68,68,0.12)',   label: 'Alert' },
  news:  { bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.18)',  badge: '#34d399', badgeBg: 'rgba(16,185,129,0.12)',  label: 'News'  },
};

const sfDisplay = { fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' };
const sfText    = { fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' };

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = React.useState<any[]>([]);
  const [vatRate, setVatRate]                   = React.useState(15);
  const [loading, setLoading]                   = React.useState(true);
  const [content, setContent]                   = React.useState<Record<string, string>>({});
  const [announcements, setAnnouncements]       = React.useState<Announcement[]>([]);
  const [promoMap, setPromoMap]                 = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    async function fetchData() {
      const [pRes, sRes, cRes, aRes] = await Promise.all([
        supabase.from('products').select('*, images:product_images(*), product_reviews(*)').eq('is_published', true).gt('stock_quantity', 0).limit(6),
        supabase.from('settings').select('*'),
        supabase.from('site_content').select('key, value'),
        supabase.from('announcements')
          .select('id, title, body, type, cta_label, cta_url, expires_at, discount_percent, announcement_products(product_id)')
          .eq('is_active', true)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`),
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
        const live = aRes.data.filter((a: any) => !a.expires_at || new Date(a.expires_at) > now);
        setAnnouncements(live);

        // Build map of product_id → highest promo discount among active promos
        const map: Record<string, number> = {};
        live.forEach((a: any) => {
          if (a.type === 'promo' && a.discount_percent && a.announcement_products) {
            a.announcement_products.forEach((link: any) => {
              map[link.product_id] = Math.max(map[link.product_id] || 0, a.discount_percent);
            });
          }
        });
        setPromoMap(map);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  // Backstop: drop expired announcements every 5 s in case onExpired didn't fire (e.g. tab was backgrounded)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setAnnouncements(prev => prev.filter(a => !a.expires_at || new Date(a.expires_at) > now));
    }, 5_000);
    return () => clearInterval(interval);
  }, []);

  const get = (key: string, fallback: string) => content[key] || fallback;

  return (
    <div className="flex flex-col bg-[#060b18]">

      {/* Announcements */}
      {announcements.length > 0 && (
        <div style={{ paddingTop: 56 }}>
          <div className="max-w-[980px] mx-auto px-6 pt-4 space-y-2">
            {announcements.map(ann => {
              const s = TYPE_STYLES[ann.type] ?? TYPE_STYLES.info;
              return (
                <div
                  key={ann.id}
                  style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <Megaphone size={13} color={s.badge} style={{ flexShrink: 0 }} />
                  <span style={{ ...sfText, fontSize: 11, fontWeight: 700, color: s.badge, letterSpacing: '0.08em', textTransform: 'uppercase', background: s.badgeBg, padding: '2px 7px', borderRadius: 5, flexShrink: 0 }}>{s.label}</span>
                  <span style={{ ...sfText, color: '#d0d8e8', fontSize: 13, flex: 1 }}>{ann.title}{ann.body ? ` — ${ann.body}` : ''}</span>
                  {ann.type === 'promo' && ann.discount_percent && (
                    <span style={{ ...sfText, fontSize: 11, color: s.badge, fontWeight: 700, flexShrink: 0 }}>−{ann.discount_percent}%</span>
                  )}
                  {ann.type === 'promo' && ann.expires_at && (
                    <span style={{ ...sfText, fontSize: 12, color: s.badge, fontWeight: 600, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, background: s.badgeBg, padding: '3px 9px', borderRadius: 5, border: `1px solid ${s.border}` }}>
                      ⏱ <PromoCountdown expiresAt={ann.expires_at} onExpired={() => setAnnouncements(prev => prev.filter(a => a.id !== ann.id))} />
                    </span>
                  )}
                  {ann.cta_label && ann.cta_url && (
                    <a href={ann.cta_url} style={{ ...sfText, color: s.badge, fontSize: 12, fontWeight: 600, textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {ann.cta_label} <ArrowRight size={11} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hero */}
      <section
        className="flex items-center justify-center text-center"
        style={{ paddingTop: announcements.length > 0 ? 80 : 140, paddingBottom: 100 }}
      >
        <div className="px-6 max-w-3xl mx-auto space-y-8">
          <p style={{ ...sfText, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#c9a46a', textTransform: 'uppercase' }}>
            {get('hero_eyebrow', 'Excellence in Craftsmanship')}
          </p>
          <h1
            className="text-white"
            style={{ ...sfDisplay, fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 600, lineHeight: 1.06, letterSpacing: '-0.5px' }}
          >
            {get('hero_tagline', 'Bespoke furniture crafted to your vision.')}
          </h1>
          <p style={{ ...sfText, color: '#6a7080', fontSize: 17, lineHeight: 1.6 }}>
            {get('hero_subtext', 'Built to last generations.')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/order-form">
              <button
                style={{ ...sfText, background: '#c9a46a', color: '#000', border: 'none', borderRadius: 999, padding: '13px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
              >
                {get('hero_cta_primary', 'Order a Piece')}
              </button>
            </Link>
            <Link to="/products">
              <button
                style={{ ...sfText, background: 'transparent', color: '#c9a46a', border: '1px solid rgba(201,164,106,0.35)', borderRadius: 999, padding: '13px 28px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
              >
                {get('hero_cta_secondary', 'Explore Collection')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[980px] mx-auto px-6 w-full">
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
      </div>

      {/* Products */}
      <section className="max-w-[980px] mx-auto px-6 w-full py-20">
        <div className="flex items-baseline justify-between mb-12">
          <div>
            <p style={{ ...sfText, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#c9a46a', textTransform: 'uppercase', marginBottom: 6 }}>
              {get('featured_eyebrow', 'Our Masterpieces')}
            </p>
            <h2 style={{ ...sfDisplay, color: '#fff', fontSize: 28, fontWeight: 600, letterSpacing: '-0.3px' }}>
              {get('featured_heading', 'Featured Collection')}
            </h2>
          </div>
          <Link to="/products" style={{ ...sfText, color: '#c9a46a', fontSize: 13, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            All products <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-square bg-white/[0.03] animate-pulse rounded-[8px]" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} vatRate={vatRate} promoDiscountPercent={promoMap[product.id]} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p style={{ ...sfText, color: '#3a4050', fontSize: 14, fontStyle: 'italic' }}>Products coming soon.</p>
          </div>
        )}
      </section>

    </div>
  );
};
