import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ui/ProductCard';
import { ScrollReveal } from '../components/ScrollReveal';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = React.useState<any[]>([]);
  const [vatRate, setVatRate] = React.useState(15);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      const { data: pData } = await supabase
        .from('products')
        .select(`*, images:product_images(*), product_reviews(*)`)
        .eq('is_published', true)
        .limit(3);

      const { data: sData } = await supabase.from('settings').select('*');
      const vRate = sData?.find(s => s.key === 'vat_rate')?.value;

      if (pData) setFeaturedProducts(pData);
      if (vRate) setVatRate(parseFloat(vRate));
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col bg-[#060b18]">
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
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Excellence in Craftsmanship</span>
              <h1
                className="text-white"
                style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif', fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: 600, lineHeight: 1.07, letterSpacing: '-0.28px' }}
              >
                Space<span className="text-[#c9a46a]">2</span>Standard
              </h1>
              <p
                className="text-[#a0a8b8] max-w-2xl mx-auto"
                style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif', fontSize: '28px', fontWeight: 400, lineHeight: 1.14, letterSpacing: '0.196px' }}
              >
                Bespoke furniture crafted to your vision.
                <br className="hidden md:inline" />
                Built to last generations.
              </p>
              <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/products">
                  <button className="btn-apple-hero">Order a Piece</button>
                </Link>
                <Link to="/products">
                  <button className="btn-apple-outline" style={{ color: '#c9a46a', borderColor: '#c9a46a', fontSize: '18px', fontWeight: 300 }}>
                    Explore Collection
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
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Our Masterpieces</span>
              <h2
                className="text-white"
                style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif', fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 600, lineHeight: 1.07, letterSpacing: '-0.28px' }}
              >
                Featured Collection
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
            {featuredProducts.map((product, idx) => (
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
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">The Artisan Way</span>
                <h2
                  className="text-white"
                  style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif', fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 600, lineHeight: 1.07, letterSpacing: '-0.28px' }}
                >
                  From Tree<br />to Table
                </h2>
                <p className="text-[17px] font-light leading-[1.8] text-[#a0a8b8] max-w-xl">
                  At Space2Standard, we don't just build furniture; we curate masterpieces. 
                  Our process combines ancient woodworking techniques with modern precision to 
                  create pieces that are as functional as they are beautiful.
                </p>
              </div>

              <div className="space-y-12">
                {[
                  { title: 'Sustainably Sourced', desc: 'We only use premium hardwoods from Namibian forests.' },
                  { title: 'Hand-Rubbed Finishes', desc: 'Natural oils and waxes that age gracefully over decades.' },
                  { title: 'Bespoke Engineering', desc: 'Intricate joinery that removes the need for visible fasteners.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-8 items-start">
                    <div className="w-10 h-10 rounded-full border border-[#c9a46a]/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="text-[#c9a46a]" size={16} />
                    </div>
                    <div className="space-y-2">
                      <h3
                    className="text-white"
                    style={{ fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif', fontSize: '21px', fontWeight: 600, lineHeight: 1.19, letterSpacing: '0.231px' }}
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
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};
