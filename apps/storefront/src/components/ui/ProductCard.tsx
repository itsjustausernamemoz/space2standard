import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@shared/types';
import { formatCurrency, calcDiscount } from '@shared/utils';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const discountedPrice = calcDiscount(
    product.price,
    product.discount_type,
    product.discount_value
  );
  
  const hasDiscount = discountedPrice < product.price;
  const primaryImage = product.images?.find(img => img.is_primary)?.storage_url || '/images/placeholder.jpg';

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
          <div className="absolute inset-0 bg-charcoal-900/60 flex items-center justify-center z-10">
            <Badge variant="charcoal" className="px-4 py-2">Out of Stock</Badge>
          </div>
        )}
      </Link>

      <div className="flex-1 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500">
            {product.category || 'Luxury Collection'}
          </p>
          <h3 className="text-xl font-serif text-walnut-950 group-hover:text-gold-600 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-lg font-bold text-walnut-800">
            {formatCurrency(discountedPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-charcoal-500 line-through opacity-60">
              {formatCurrency(product.price)}
            </span>
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
