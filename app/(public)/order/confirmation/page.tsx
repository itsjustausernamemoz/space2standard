'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        const { data } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single()
        setOrder(data)
        setLoading(false)
      }
      fetchOrder()
    }
  }, [orderId, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a84c]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 max-w-4xl text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-12"
      >
        <div className="relative w-24 h-24 bg-[#c9a84c]/10 border border-[#c9a84c]/20 mx-auto flex items-center justify-center">
          <CheckCircle2 className="text-[#c9a84c]" size={48} strokeWidth={1} />
        </div>

        <div className="space-y-4">
          <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest">Thank You for your Order</span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-[#e8d5b7]">
            Crafting Your Masterpiece
          </h1>
          <p className="text-[#e8d5b7]/60 font-light max-w-xl mx-auto text-lg leading-relaxed">
            Order #{orderId?.slice(0, 8).toUpperCase()} has been successfully received.
            Our team will reach out to you within 24 hours to confirm the details.
          </p>
        </div>

        {order && (
          <div className="bg-[#16213e]/40 border border-[#c9a84c]/10 p-12 text-left space-y-8 backdrop-blur-md">
            <h2 className="text-2xl font-serif text-[#e8d5b7] tracking-wide border-b border-[#c9a84c]/10 pb-6">
              Order Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] text-[#c9a84c] uppercase font-bold tracking-widest">Customer</span>
                  <p className="text-[#e8d5b7] font-serif text-xl">{order.customer_name}</p>
                  <p className="text-sm opacity-50 font-light">{order.customer_email}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-[#c9a84c] uppercase font-bold tracking-widest">Delivery Address</span>
                  <p className="text-[#e8d5b7] font-light leading-relaxed">{order.delivery_address}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <span className="text-[10px] text-[#c9a84c] uppercase font-bold tracking-widest">Items Ordered</span>
                  {order.order_items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm font-light">
                      <span className="text-[#e8d5b7]">{item.product_name} <span className="opacity-30">x {item.quantity}</span></span>
                      <span className="text-[#c9a84c] font-bold">${item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-[#c9a84c]/10 flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest font-bold text-[#e8d5b7]/50">Grand Total</span>
                  <span className="text-3xl font-serif text-[#c9a84c]">${order.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-8">
          <Link
            href="/products"
            className="bg-[#c9a84c] text-[#1a1a2e] px-12 py-5 text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition flex items-center gap-4"
          >
            <ShoppingBag size={18} /> Continue Browsing
          </Link>
          <Link
            href="/"
            className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest border-b border-[#c9a84c] pb-2 hover:opacity-70 transition flex items-center gap-4"
          >
            Return Home <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-32 pb-20">
      <Suspense fallback={
        <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a84c]" />
        </div>
      }>
        <OrderConfirmationContent />
      </Suspense>
    </div>
  )
}
