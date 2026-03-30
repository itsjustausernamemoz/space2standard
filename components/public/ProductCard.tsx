'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from '@/lib/hooks/useCart'
import { Plus, ShoppingCart, Info } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description?: string
    price: number
    discount_percent?: number
    discounted_price: number
    images?: string[]
    category?: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      discounted_price: product.discounted_price,
      quantity: 1,
      image: product.images?.[0],
    })
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative bg-[#16213e] border border-[#c9a84c]/10 overflow-hidden backdrop-blur-sm shadow-xl transition-all duration-500 hover:shadow-[#c9a84c]/10"
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-[#0f3460] flex items-center justify-center opacity-40">
              <span className="text-xs uppercase tracking-widest font-bold text-[#e8d5b7]">No Image</span>
            </div>
          )}

          {product.discount_percent && product.discount_percent > 0 && (
            <div className="absolute top-4 right-4 bg-[#c9a84c] text-[#1a1a2e] text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-lg">
              {product.discount_percent}% Off
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#16213e] via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
            <div className="flex gap-2 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#c9a84c] text-[#1a1a2e] text-[10px] font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-[#e8d5b7] transition"
              >
                <ShoppingCart size={14} /> Add to Cart
              </button>
              <Link
                href={`/products/${product.id}`}
                className="w-12 h-10 bg-[#0f3460] border border-[#c9a84c]/20 flex items-center justify-center text-[#e8d5b7] hover:bg-[#c9a84c] hover:text-[#1a1a2e] transition"
              >
                <Info size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-widest mb-1">{product.category || 'Collection'}</p>
              <h3 className="text-xl font-serif tracking-wide text-[#e8d5b7] line-clamp-1">{product.name}</h3>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-[#c9a84c] font-bold text-lg font-serif">
              ${product.discounted_price.toLocaleString()}
            </span>
            {product.discount_percent && product.discount_percent > 0 && (
              <span className="text-[#e8d5b7]/30 line-through text-xs font-mono">
                ${product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
