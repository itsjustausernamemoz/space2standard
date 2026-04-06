import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@shared/types';
import { ProductCard } from '../components/ui/ProductCard';
import { motion } from 'framer-motion';

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [vatRate, setVatRate] = useState(15);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Products
      const { data: pData } = await supabase
        .from('products')
        .select(`*, images:product_images(*), product_reviews(*), category_rel:categories(name)`)
        .eq('is_published', true);

      // 2. Fetch Global VAT Settings
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
    <div className="pt-40 pb-32 min-h-screen bg-navy-950">
      <div className="container mx-auto px-6">
        <header className="max-w-4xl space-y-12 mb-24">
          <div className="space-y-6">
            <span className="section-label">Our Collection</span>
            <h1 className="text-6xl md:text-8xl font-serif text-navy-300 tracking-tight leading-none">
              Bespoke Masterpieces
            </h1>
          </div>
          <p className="text-xl font-light text-navy-400 leading-relaxed max-w-2xl">
            Each piece is crafted from premium, sustainably sourced hardwoods. 
            Blending traditional artistry with modern functional design.
          </p>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-8 items-center border-b border-gold-500/10 pb-8 mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-500">Filter by category</span>
          <div className="flex flex-wrap gap-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-[11px] font-bold uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${
                  category === cat ? 'border-gold-500 text-gold-500' : 'border-transparent text-navy-400 hover:text-gold-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-[4/5] bg-navy-900 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <ProductCard product={product} vatRate={vatRate} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-8 max-w-xl mx-auto">
             <div className="gold-divider" />
             <p className="text-2xl font-serif text-navy-300 italic">
               No pieces in this collection yet.
             </p>
             <p className="text-sm font-light text-navy-500">
               Our master craftsmen are currently working on new designs. 
               Check back soon or start a bespoke journey through our contact form.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};
