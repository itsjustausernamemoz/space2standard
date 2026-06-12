import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '@shared/types';
import { formatCurrency, calcDiscount } from '@shared/utils';

interface ProductCardProps {
  product: Product;
  vatRate?: number;
  promoDiscountPercent?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, vatRate = 0, promoDiscountPercent }) => {
  const discountedPrice = calcDiscount(
    product.price,
    product.discount_type,
    product.discount_value
  );

  // Promo discount (from an active announcement) takes priority over the product's own discount
  const effectiveBasePrice = promoDiscountPercent != null
    ? product.price * (1 - promoDiscountPercent / 100)
    : discountedPrice;

  const displayPrice = vatRate > 0 ? effectiveBasePrice * (1 + vatRate / 100) : effectiveBasePrice;
  const originalPriceInclVat = vatRate > 0 ? product.price * (1 + vatRate / 100) : product.price;

  const hasDiscount = effectiveBasePrice < product.price;
  const primaryImage = product.images?.find(img => img.is_primary)?.storage_url || '/images/placeholder.jpg';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, borderColor: 'rgba(201,164,106,0.4)' }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col h-full bg-transparent border-[0.5px] border-white/8 rounded-[6px] transition-colors duration-200"
    >
      {/* Image Container */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden rounded-t-[6px]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1220] to-[#1a1830] z-0" />
        <img 
          src={primaryImage} 
          alt={product.name}
          className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {promoDiscountPercent != null ? (
            <span className="bg-[#c9a46a] text-[#060b18] px-2 py-1 rounded-[3px] text-[9px] font-bold uppercase tracking-[0.1em]">
              -{promoDiscountPercent}%
            </span>
          ) : hasDiscount ? (
            <span className="bg-[#c9a46a] text-[#060b18] px-2 py-1 rounded-[3px] text-[9px] font-bold uppercase tracking-[0.1em]">
              Sale
            </span>
          ) : null}
        </div>
        
        <div className="absolute top-4 right-4 z-20">
          {product.stock_quantity <= 3 && product.stock_quantity > 0 && (
            <span className="bg-white/10 text-white border-[0.5px] border-white/20 px-2 py-1 rounded-[3px] text-[9px] font-bold uppercase tracking-[0.1em]">
              Only {product.stock_quantity} left
            </span>
          )}
        </div>

        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-[#060b18]/60 flex items-center justify-center z-30">
            <span className="bg-white/10 text-white border-[0.5px] border-white/20 px-3 py-1 rounded-[3px] text-[9px] font-bold uppercase tracking-[0.1em]">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Content Block */}
      <div className="flex-1 flex flex-col p-[16px_18px_20px] space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">
            {product.category || (product as any).category_rel?.name || 'Luxury Collection'}
          </p>
          <h3 className="text-[18px] font-serif font-normal text-white leading-[1.3] line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-[16px] font-medium text-white">
              {formatCurrency(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[13px] text-[#6a7080] line-through">
                {formatCurrency(originalPriceInclVat)}
              </span>
            )}
          </div>
          {vatRate > 0 && (
            <p className="text-[11px] text-[#4a5060] font-normal">Incl. {vatRate}% VAT</p>
          )}
        </div>
      </div>

      <div className="px-[18px] pb-[20px]">
        <Link to={`/products/${product.id}`} className="block">
          <button className="w-full py-[11px] border-[0.5px] border-white/20 rounded-[4px] text-[10px] font-medium uppercase tracking-[0.12em] text-white transition-all duration-150 group-hover:border-[#c9a46a]/60 group-hover:text-[#c9a46a]">
            View Details
          </button>
        </Link>
      </div>
    </motion.div>
  );
};

