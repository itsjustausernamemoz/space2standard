'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/hooks/useCart'
import Link from 'next/link'
import Image from 'next/image'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#1a1a2e] z-[101] shadow-2xl border-l border-[#c9a84c]/20 flex flex-col"
          >
            <div className="p-6 border-b border-[#c9a84c]/10 flex items-center justify-between">
              <h2 className="text-xl font-serif text-[#e8d5b7] uppercase tracking-wider flex items-center gap-3">
                <ShoppingBag className="text-[#c9a84c]" size={20} />
                Your Order
              </h2>
              <button
                onClick={onClose}
                className="text-[#e8d5b7] hover:text-[#c9a84c] transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#e8d5b7]/50 space-y-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="text-sm uppercase tracking-widest">Your cart is empty</p>
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="text-[#c9a84c] border border-[#c9a84c] px-6 py-2 hover:bg-[#c9a84c] hover:text-[#1a1a2e] transition text-xs font-bold uppercase tracking-widest"
                  >
                    Start Browsing
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="relative w-24 h-24 bg-[#16213e] rounded overflow-hidden border border-[#c9a84c]/10">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition duration-500"
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="text-[#e8d5b7] font-serif tracking-wide">{item.name}</h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#e8d5b7]/30 hover:text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-[#c9a84c] font-bold">
                        ${(item.discounted_price || item.price).toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 border border-[#c9a84c]/30 flex items-center justify-center text-[#e8d5b7] hover:border-[#c9a84c] transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm text-[#e8d5b7] font-mono w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 border border-[#c9a84c]/30 flex items-center justify-center text-[#e8d5b7] hover:border-[#c9a84c] transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-[#c9a84c]/10 bg-[#16213e]/50 space-y-4">
                <div className="flex justify-between items-center text-[#e8d5b7] uppercase tracking-widest text-sm">
                  <span>Total Amount</span>
                  <span className="text-xl font-bold text-[#c9a84c] font-serif">
                    ${totalPrice().toLocaleString()}
                  </span>
                </div>
                <Link
                  href="/order"
                  onClick={onClose}
                  className="block w-full bg-[#c9a84c] text-[#1a1a2e] text-center font-bold py-4 uppercase tracking-widest hover:bg-opacity-90 transition shadow-lg shadow-[#c9a84c]/10"
                >
                  Proceed to Order
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
