import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Product } from '@shared/types';
import { formatCurrency, calcDiscount } from '@shared/utils';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, Truck, ShieldCheck, Hammer } from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select(`*, images:product_images(*)`)
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error(error);
        navigate('/products');
      } else {
        setProduct(data);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="pt-40 pb-32 flex items-center justify-center min-h-screen">
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
  const hasDiscount = discountedPrice < product.price;

  const images = product.images && product.images.length > 0 
    ? product.images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)) 
    : [{ storage_url: '/images/placeholder.jpg', id: 'placeholder' }];

  return (
    <div className="pt-40 pb-32 min-h-screen bg-cream-50">
      <div className="container mx-auto px-6">
        <Link to="/products" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-600 hover:text-gold-500 transition-colors mb-12">
          <ChevronLeft size={16} />
          Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Image Gallery */}
          <div className="space-y-8">
            <div className="aspect-[4/5] relative rounded-2xl overflow-hidden bg-cream-200 border border-gold-500/10">
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all border border-white/20"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => setActiveImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all border border-white/20"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-24 aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-gold-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
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
                  <Badge variant="walnut">Limited Stock: {product.stock_quantity} remaining</Badge>
                )}
                {product.stock_quantity === 0 && <Badge variant="charcoal">On Request Only</Badge>}
              </div>

              <h1 className="text-5xl md:text-7xl font-serif text-walnut-950 tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-6 border-b border-gold-500/10 pb-8">
                <span className="text-4xl font-bold text-walnut-800">
                  {formatCurrency(discountedPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-charcoal-500 line-through opacity-50">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
            </div>

            <p className="text-lg font-light text-charcoal-700 leading-relaxed italic">
              {product.description || 'A timeless addition to any space, meticulously crafted from the finest materials.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gold-500/10 pt-12">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500 flex items-center gap-2">
                  <Hammer size={16} strokeWidth={1.5} /> Materials
                </h3>
                <p className="text-sm font-light text-charcoal-600 leading-relaxed">
                  {product.materials || 'Sustainably sourced premium hardwood, traditional oil rub finish, artisan joinery.'}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gold-500">Dimensions</h3>
                <p className="text-sm font-light text-charcoal-600 leading-relaxed">
                  {product.dimensions || 'Approx. 220cm (L) x 100cm (W) x 75cm (H). Bespoke sizing available on request.'}
                </p>
              </div>
            </div>

            <div className="space-y-8 pt-8">
               <Link to={`/order?product=${product.id}`}>
                 <Button size="xl" variant="primary" className="w-full">
                   Order This Piece
                 </Button>
               </Link>
               
               <div className="flex flex-col gap-4 text-[10px] uppercase tracking-[0.2em] font-medium text-charcoal-500">
                  <div className="flex items-center gap-3">
                    <Truck size={14} className="text-gold-500" strokeWidth={1.5} />
                    White-glove nationwide delivery
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={14} className="text-gold-500" strokeWidth={1.5} />
                    Lifetime craftsmanship guarantee
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
