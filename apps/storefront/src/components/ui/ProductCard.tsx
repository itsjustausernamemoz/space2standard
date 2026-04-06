import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@shared/types';
import { formatCurrency, calcDiscount } from '@shared/utils';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { ArrowRight, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  vatRate?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, vatRate = 0 }) => {
  const discountedPrice = calcDiscount(
    product.price,
    product.discount_type,
    product.discount_value
  );
  
  const displayPrice = vatRate > 0 ? discountedPrice * (1 + vatRate / 100) : discountedPrice;
  const originalPriceInclVat = vatRate > 0 ? product.price * (1 + vatRate / 100) : product.price;

  const hasDiscount = discountedPrice < product.price;
  const primaryImage = product.images?.find(img => img.is_primary)?.storage_url || '/images/placeholder.jpg';

  const approvedReviews = product.product_reviews?.filter(r => r.is_approved) || [];
  const avgRating = approvedReviews.length > 0
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
    : 0;

  return (
    <Card className="group flex flex-col h-full bg-cream-100/50 hover:bg-white transition-all cursor-pointer">
      <Link to={`/products/${product.id}`} className="block relative aspect-[4/5] overflow-hidden rounded-t-lg -mx-8 -mt-8 mb-6">
        <img 
          src={primaryImage} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {hasDiscount && (
          <Badge variant="gold" className="absolute top-4 left-4 z-10">
            Sale
          </Badge>
        )}
        
        {product.stock_quantity <= 3 && product.stock_quantity > 0 && (
          <Badge variant="walnut" className="absolute top-4 right-4 z-10">
            Only {product.stock_quantity} left
          </Badge>
        )}

        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center z-10">
            <Badge variant="charcoal" className="px-4 py-2">Out of Stock</Badge>
          </div>
        )}
      </Link>

      <div className="flex-1 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500">
            {product.category || 'Luxury Collection'}
          </p>
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-xl font-serif text-navy-950 group-hover:text-gold-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
            {approvedReviews.length > 0 && (
              <div className="flex items-center gap-1 shrink-0 pt-1">
                <Star className="text-gold-500 fill-gold-500" size={12} strokeWidth={1} />
                <span className="text-[10px] font-bold text-navy-600">{avgRating.toFixed(1)}</span>
                <span className="text-[10px] text-navy-400">({approvedReviews.length})</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-bold text-navy-800">
              {formatCurrency(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-navy-400 line-through opacity-60">
                {formatCurrency(originalPriceInclVat)}
              </span>
            )}
          </div>
          {vatRate > 0 && (
            <p className="text-[9px] text-navy-400 font-light italic">Incl. {vatRate}% VAT</p>
          )}
        </div>
      </div>

      <div className="pt-6 mt-auto">
        <Link to={`/products/${product.id}`}>
          <Button variant="outline" className="w-full group/btn" size="sm">
            View Details
            <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};
