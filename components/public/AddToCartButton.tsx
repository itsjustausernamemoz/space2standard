'use client'

import { useState } from 'react'
import { useCart } from '@/lib/hooks/useCart'
import { Plus, Minus, ShoppingCart, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AddToCartButton({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      discounted_price: product.discounted_price,
      quantity,
      image: product.images?.[0],
    })
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      <div className="flex items-center border border-[#c9a84c]/20 bg-[#16213e] p-4 gap-6">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="text-[#e8d5b7] hover:text-[#c9a84c] transition"
        >
          <Minus size={18} />
        </button>
        <span className="text-xl font-mono text-[#e8d5b7] w-8 text-center">{quantity}</span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="text-[#e8d5b7] hover:text-[#c9a84c] transition"
        >
          <Plus size={18} />
        </button>
      </div>
      <button
        onClick={handleAdd}
        className="flex-1 bg-[#c9a84c] text-[#1a1a2e] px-12 py-5 text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition flex items-center justify-center gap-4 shadow-xl shadow-[#c9a84c]/10"
      >
        <ShoppingBag size={20} /> Add to Order
      </button>
    </div>
  )
}
