import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@shared/types';
import { ProductCard } from '../components/ui/ProductCard';
import { ScrollReveal } from '../components/ScrollReveal';

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [vatRate, setVatRate] = useState(15);

  useEffect(() => {
    async function fetchData() {
      const { data: pData } = await supabase
        .from('products')
        .select(`*, images:product_images(*), product_reviews(*), category_rel:categories(name)`)
        .eq('is_published', true);

      const { data: sData } = await supabase
        .from('settings')
        .select('*');
      
      const vRate = sData?.find(s => s.key === 'vat_rate')?.value;

      setProducts(pData || []);
      if (vRate) setVatRate(parseFloat(vRate));
      setLoading(false);
    }
    fetchData();
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category_rel?.name || p.category || 'General'))];
  const filteredProducts = category === 'All' 
    ? products 
    : products.filter(p => (p.category_rel?.name || p.category || 'General') === category);

  return (
    <div className="pt-[56px] min-h-screen bg-[#060b18]">
      <div className="container mx-auto px-6">
        {/* Apple-style Hero */}
        <section className="py-16 text-center flex flex-col items-center">
          <ScrollReveal>
             <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a46a] mb-6 block">Our Collection</span>
             <h1 className="text-[48px] md:text-[72px] font-serif text-white tracking-[-0.02em] leading-[1.1] mb-8 max-w-4xl">
               Bespoke Masterpieces
             </h1>
             <p className="text-[17px] text-[#a0a8b8] leading-[1.8] max-w-[560px] font-light">
               Each piece is crafted from premium, sustainably sourced hardwoods. 
               Blending traditional artistry with modern functional design.
             </p>
          </ScrollReveal>
        </section>

        {/* Filter Bar */}
        <section className="mb-24">
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col md:flex-row md:items-center gap-6 pb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c9a46a]">Filter by category</span>
              <div className="flex flex-wrap gap-3">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-1.5 rounded-[20px] text-[11px] font-medium uppercase tracking-[0.1em] border-[0.5px] transition-all duration-200 ${
                      category === cat 
                        ? 'border-[#c9a46a] text-[#c9a46a] bg-[#c9a46a]/[0.07]' 
                        : 'border-[#c9a46a]/30 text-[#a0a8b8] hover:border-[#c9a46a]/60 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[0.5px] bg-white/10 w-full" />
          </ScrollReveal>
        </section>

        {/* Product Grid */}
        <section className="pb-32">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-square bg-white/[0.03] animate-pulse rounded-[6px]" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, idx) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  vatRate={vatRate} 
                />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="text-xl font-serif text-[#a0a8b8] italic">
                No pieces found in this collection.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

