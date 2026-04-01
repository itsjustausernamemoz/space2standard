import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Product } from '@shared/types';
import { formatCurrency, calcDiscount } from '@shared/utils';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Hammer } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [vatRate, setVatRate] = useState(15);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Product
      const { data: pData, error } = await supabase
        .from('products')
        .select(`*, images:product_images(*)`)
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error(error);
        navigate('/products');
      } else {
        setProduct(pData);
      }

      // 2. Fetch Global settings
      const { data: sData } = await supabase.from('settings').select('*');
      const vRate = sData?.find(s => s.key === 'vat_rate')?.value;
      if (vRate) setVatRate(parseFloat(vRate));

      setLoading(false);
    }
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="pt-40 pb-32 flex items-center justify-center min-h-screen bg-navy-950">
        <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const discountedPrice = calcDiscount(
    product.price,
    product.discount_type,
    product.discount_value
  );
  
  const displayPrice = vatRate > 0 ? discountedPrice * (1 + vatRate / 100) : discountedPrice;
  const originalPriceInclVat = vatRate > 0 ? product.price * (1 + vatRate / 100) : product.price;

  const hasDiscount = discountedPrice < product.price;

  const images = product.images && product.images.length > 0 
    ? [...product.images].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) 
    : [{ storage_url: '/images/placeholder.jpg', id: 'placeholder' }];

  return (
    <div className="pt-40 pb-32 min-h-screen bg-navy-950">
      <div className="container mx-auto px-6">
        <Link to="/products" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500 hover:text-white transition-colors mb-12">
          <ChevronLeft size={16} />
          Back to Artisan Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Image Gallery */}
          <div className="space-y-8">
            <div className="aspect-[4/5] relative rounded-2xl overflow-hidden bg-navy-900 border border-gold-500/10 shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={images[activeImageIndex].id}
                  src={images[activeImageIndex].storage_url}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-navy-950/20 backdrop-blur-md rounded-full text-white hover:bg-navy-950/60 transition-all border border-white/10"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => setActiveImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-navy-950/20 backdrop-blur-md rounded-full text-white hover:bg-navy-950/60 transition-all border border-white/10"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {images.map((img: any, idx: number) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-24 aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-gold-500 scale-105 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'
                    }`}
                  >
                    <img src={img.storage_url} alt={`${product.name} thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="section-label mb-0">{product.category || 'Luxury Collection'}</span>
                {product.stock_quantity <= 3 && product.stock_quantity > 0 && (
                  <Badge variant="walnut" className="bg-gold-500/10 text-gold-500 border-gold-500/30">Limited Stock: {product.stock_quantity} pieces</Badge>
                )}
                {product.stock_quantity === 0 && <Badge variant="charcoal">Custom Request Only</Badge>}
              </div>

              <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight leading-none">
                {product.name}
              </h1>

              <div className="space-y-2 border-b border-gold-500/10 pb-8">
                <div className="flex items-baseline gap-6">
                  <span className="text-4xl font-bold text-white">
                    {formatCurrency(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-navy-500 line-through">
                      {formatCurrency(originalPriceInclVat)}
                    </span>
                  )}
                </div>
                {vatRate > 0 && (
                   <p className="text-xs text-navy-400 font-light italic">Prices are inclusive of {vatRate}% Namibian VAT.</p>
                )}
              </div>
            </div>

            <p className="text-lg font-light text-cream-100/80 leading-relaxed italic max-w-xl">
              {product.description || 'A timeless addition to any space, meticulously crafted from the finest materials.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gold-500/10 pt-12">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 flex items-center gap-2">
                  <Hammer size={16} strokeWidth={1.5} /> Materiality
                </h3>
                <p className="text-sm font-light text-navy-400 leading-relaxed">
                  {product.materials || 'Sustainably sourced premium hardwood, traditional oil rub finish, artisan joinery.'}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500">Specifications</h3>
                <p className="text-sm font-light text-navy-400 leading-relaxed">
                  {product.dimensions || 'Approx. 220cm (L) x 100cm (W) x 75cm (H). Bespoke sizing available on request.'}
                </p>
              </div>
            </div>

            <div className="space-y-8 pt-8">
               <Button onClick={() => addToCart(product)} size="xl" variant="primary" className="w-full bg-gold-600 hover:bg-gold-500 text-white rounded-xl py-6">
                 Add to Cart
               </Button>
               
               <div className="flex flex-col gap-5 text-[10px] uppercase tracking-[0.2em] font-bold text-navy-500">
                  <div className="flex items-center gap-3">
                    <Truck size={14} className="text-gold-500" strokeWidth={2} />
                    White-glove nationwide delivery in Namibia
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={14} className="text-gold-500" strokeWidth={2} />
                    Lifetime studio craftsmanship guarantee
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
