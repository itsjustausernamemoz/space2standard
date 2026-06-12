import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const sfDisplay = { fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' };
const sfText    = { fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' };

interface Review {
  id: string;
  client_name: string;
  client_role: string | null;
  quote: string;
  rating: number;
  is_featured: boolean;
  product_id: string | null;
  product?: { id: string; name: string; images?: { storage_url: string; is_primary: boolean }[] } | null;
}

const Stars: React.FC<{ count: number }> = ({ count }) => (
  <span style={{ color: '#c9a46a', fontSize: 14, letterSpacing: 2 }}>
    {'★'.repeat(count)}{'☆'.repeat(5 - count)}
  </span>
);

export const Reviews: React.FC = () => {
  const [reviews, setReviews]     = React.useState<Review[]>([]);
  const [loading, setLoading]     = React.useState(true);
  const [filterProduct, setFilter] = React.useState<string>('all');

  React.useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('testimonials')
        .select('id, client_name, client_role, quote, rating, is_featured, product_id, product:products(id, name, images:product_images(storage_url, is_primary))')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false })
        .order('sort_order');
      setReviews((data as unknown as Review[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const products = React.useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string }[] = [];
    reviews.forEach(r => {
      if (r.product_id && r.product && !seen.has(r.product_id)) {
        seen.add(r.product_id);
        list.push({ id: r.product_id, name: r.product.name });
      }
    });
    return list;
  }, [reviews]);

  const filtered = filterProduct === 'all' ? reviews : reviews.filter(r => r.product_id === filterProduct);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="flex flex-col bg-[#060b18] min-h-screen" style={{ paddingTop: 56 }}>

      {/* Hero */}
      <section className="max-w-[980px] mx-auto px-6 w-full pt-20 pb-14 text-center">
        <p style={{ ...sfText, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#c9a46a', textTransform: 'uppercase', marginBottom: 12 }}>
          Customer Stories
        </p>
        <h1 style={{ ...sfDisplay, color: '#fff', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 600, letterSpacing: '-0.5px', lineHeight: 1.06, marginBottom: 16 }}>
          What Our Clients Say
        </h1>
        {avgRating && reviews.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8 }}>
            <span style={{ color: '#c9a46a', fontSize: 22 }}>★</span>
            <span style={{ ...sfDisplay, color: '#fff', fontSize: 28, fontWeight: 600 }}>{avgRating}</span>
            <span style={{ ...sfText, color: '#5a6070', fontSize: 14 }}>out of 5 · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </section>

      {/* Product filter pills */}
      {products.length > 0 && (
        <div className="max-w-[980px] mx-auto px-6 w-full pb-10">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[{ id: 'all', name: 'All Reviews' }, ...products].map(p => (
              <button
                key={p.id}
                onClick={() => setFilter(p.id)}
                style={{
                  ...sfText,
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '7px 16px',
                  borderRadius: 999,
                  border: `1px solid ${filterProduct === p.id ? 'rgba(201,164,106,0.6)' : 'rgba(255,255,255,0.1)'}`,
                  background: filterProduct === p.id ? 'rgba(201,164,106,0.12)' : 'transparent',
                  color: filterProduct === p.id ? '#c9a46a' : '#6a7080',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Review grid */}
      <section className="max-w-[980px] mx-auto px-6 w-full pb-24">
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: 200, background: 'rgba(255,255,255,0.03)', borderRadius: 16, animation: 'pulse 2s infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ ...sfText, color: '#3a4050', fontSize: 14 }}>No reviews yet.</p>
          </div>
        ) : (
          <div style={{ columns: '320px', columnGap: 20 }}>
            {filtered.map(r => {
              const thumb = r.product?.images?.find(i => i.is_primary)?.storage_url || r.product?.images?.[0]?.storage_url;
              return (
                <div
                  key={r.id}
                  style={{
                    breakInside: 'avoid',
                    marginBottom: 20,
                    background: r.is_featured ? 'rgba(201,164,106,0.04)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${r.is_featured ? 'rgba(201,164,106,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 16,
                    padding: '24px 26px',
                  }}
                >
                  {r.is_featured && (
                    <span style={{ ...sfText, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a46a', background: 'rgba(201,164,106,0.1)', padding: '3px 9px', borderRadius: 6, display: 'inline-block', marginBottom: 14 }}>
                      Featured
                    </span>
                  )}

                  {/* Stars */}
                  <Stars count={r.rating} />

                  {/* Quote */}
                  <p style={{ ...sfText, color: '#d0d8e8', fontSize: 15, lineHeight: 1.65, marginTop: 12, marginBottom: 18, fontStyle: 'italic' }}>
                    "{r.quote}"
                  </p>

                  {/* Client */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ ...sfText, color: '#fff', fontSize: 13, fontWeight: 600 }}>{r.client_name}</p>
                      {r.client_role && <p style={{ ...sfText, color: '#5a6070', fontSize: 12, marginTop: 2 }}>{r.client_role}</p>}
                    </div>
                  </div>

                  {/* Linked product */}
                  {r.product && r.product_id && (
                    <Link
                      to={`/products/${r.product_id}`}
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {thumb && (
                        <img
                          src={thumb}
                          alt={r.product.name}
                          style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', background: '#0d1220', flexShrink: 0 }}
                        />
                      )}
                      <div>
                        <p style={{ ...sfText, color: '#5a6070', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Reviewed product</p>
                        <p style={{ ...sfText, color: '#c9a46a', fontSize: 13, fontWeight: 500 }}>{r.product.name}</p>
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
