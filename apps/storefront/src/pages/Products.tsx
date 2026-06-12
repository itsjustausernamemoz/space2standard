import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@shared/types';
import { ProductCard } from '../components/ui/ProductCard';

const sfDisplay = { fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' };
const sfText    = { fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' };

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('All');
  const [vatRate, setVatRate]   = useState(15);

  useEffect(() => {
    async function fetchData() {
      const [{ data: pData }, { data: sData }] = await Promise.all([
        supabase.from('products').select('*, images:product_images(*), product_reviews(*), category_rel:categories(name)').eq('is_published', true),
        supabase.from('settings').select('*'),
      ]);
      setProducts(pData || []);
      const vRate = sData?.find(s => s.key === 'vat_rate')?.value;
      if (vRate) setVatRate(parseFloat(vRate));
      setLoading(false);
    }
    fetchData();
  }, []);

  const categories     = ['All', ...new Set(products.map(p => p.category_rel?.name || p.category || 'General'))];
  const filteredProducts = category === 'All' ? products : products.filter(p => (p.category_rel?.name || p.category || 'General') === category);

  return (
    <div className="min-h-screen bg-[#060b18]" style={{ paddingTop: 88 }}>
      <div className="max-w-[980px] mx-auto px-6">

        {/* Page header */}
        <div className="mb-10">
          <h1 style={{ ...sfDisplay, color: '#fff', fontSize: 34, fontWeight: 600, letterSpacing: '-0.4px' }}>Collection</h1>
          <p style={{ ...sfText, color: '#5a6070', fontSize: 14, marginTop: 6 }}>Bespoke hardwood furniture, crafted to order.</p>
        </div>

        {/* Category filter */}
        {!loading && categories.length > 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  ...sfText,
                  padding: '6px 16px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid',
                  transition: 'all 0.15s',
                  borderColor: category === cat ? '#c9a46a' : 'rgba(255,255,255,0.1)',
                  background:  category === cat ? 'rgba(201,164,106,0.1)' : 'transparent',
                  color:       category === cat ? '#c9a46a' : '#6a7080',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 40 }} />

        {/* Grid */}
        <div className="pb-24">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square bg-white/[0.03] animate-pulse rounded-[8px]" />)}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => <ProductCard key={product.id} product={product} vatRate={vatRate} />)}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p style={{ ...sfText, color: '#3a4050', fontSize: 14, fontStyle: 'italic' }}>No pieces in this category.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
