'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCart } from '@/lib/hooks/useCart'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { ShoppingBag, CreditCard, ShieldCheck, Truck, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const orderSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  delivery_address: z.string().min(5, 'Delivery address is required'),
  notes: z.string().optional(),
})

type OrderFormData = z.infer<typeof orderSchema>

export default function OrderPage() {
  const { items, totalPrice, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  })

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      router.push('/products')
    }
  }, [items, router, isSubmitting])

  const onSubmit = async (formData: OrderFormData) => {
    setIsSubmitting(true)
    const toastId = toast.loading('Processing your order...')

    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.full_name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          delivery_address: formData.delivery_address,
          notes: formData.notes,
          total_amount: totalPrice(),
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        discount_percent: item.discounted_price ? Math.round(((item.price - item.discounted_price) / item.price) * 100) : 0,
        subtotal: (item.discounted_price || item.price) * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      toast.success('Order placed successfully!', { id: toastId })
      clearCart()
      router.push(`/order/confirmation?id=${order.id}`)
    } catch (error: any) {
      console.error('Order error:', error)
      toast.error(error.message || 'Failed to place order. Please try again.', { id: toastId })
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-2 text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-12">
          <Link href="/" className="opacity-50 hover:opacity-100 transition">Home</Link>
          <ChevronRight size={12} className="opacity-30" />
          <Link href="/products" className="opacity-50 hover:opacity-100 transition">Collection</Link>
          <ChevronRight size={12} className="opacity-30" />
          <span className="text-[#e8d5b7]">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
          {/* Order Form */}
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-serif tracking-tight text-[#e8d5b7]">
                Complete Your Order
              </h1>
              <p className="text-[#e8d5b7]/50 font-light max-w-xl">
                Please provide your details below. Our team will contact you within 24 hours to confirm your order and discuss delivery details.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#c9a84c]">Full Name</label>
                  <input
                    {...register('full_name')}
                    className={`w-full bg-[#16213e] border ${errors.full_name ? 'border-red-500' : 'border-[#c9a84c]/20'} p-4 text-[#e8d5b7] focus:outline-none focus:border-[#c9a84c] transition font-light`}
                    placeholder="John Doe"
                  />
                  {errors.full_name && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.full_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#c9a84c]">Email Address</label>
                  <input
                    {...register('email')}
                    className={`w-full bg-[#16213e] border ${errors.email ? 'border-red-500' : 'border-[#c9a84c]/20'} p-4 text-[#e8d5b7] focus:outline-none focus:border-[#c9a84c] transition font-light`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#c9a84c]">Phone Number</label>
                  <input
                    {...register('phone')}
                    className={`w-full bg-[#16213e] border ${errors.phone ? 'border-red-500' : 'border-[#c9a84c]/20'} p-4 text-[#e8d5b7] focus:outline-none focus:border-[#c9a84c] transition font-light`}
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#c9a84c]">Delivery Address</label>
                  <input
                    {...register('delivery_address')}
                    className={`w-full bg-[#16213e] border ${errors.delivery_address ? 'border-red-500' : 'border-[#c9a84c]/20'} p-4 text-[#e8d5b7] focus:outline-none focus:border-[#c9a84c] transition font-light`}
                    placeholder="123 Artisan St, Craftville"
                  />
                  {errors.delivery_address && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.delivery_address.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#c9a84c]">Special Instructions / Notes (Optional)</label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="w-full bg-[#16213e] border border-[#c9a84c]/20 p-4 text-[#e8d5b7] focus:outline-none focus:border-[#c9a84c] transition font-light resize-none"
                  placeholder="Tell us any specific requirements or delivery instructions..."
                />
              </div>

              <div className="pt-8 border-t border-[#c9a84c]/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#c9a84c] text-[#1a1a2e] py-6 text-sm font-bold uppercase tracking-[0.2em] hover:bg-opacity-90 transition disabled:opacity-50 shadow-xl shadow-[#c9a84c]/10 flex items-center justify-center gap-4"
                >
                  {isSubmitting ? 'Processing...' : 'Place Secure Order'}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8 bg-[#16213e]/40 border border-[#c9a84c]/10 p-8 lg:p-12 backdrop-blur-md shadow-2xl">
              <h2 className="text-2xl font-serif text-[#e8d5b7] tracking-wide border-b border-[#c9a84c]/10 pb-6">
                Order Summary
              </h2>

              <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-20 h-20 bg-[#16213e] border border-[#c9a84c]/10">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-serif tracking-wide text-[#e8d5b7] mb-1">{item.name}</h3>
                      <p className="text-[10px] text-[#e8d5b7]/50 uppercase tracking-widest mb-2">Quantity: {item.quantity}</p>
                      <p className="text-[#c9a84c] font-bold text-sm">
                        ${((item.discounted_price || item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-[#c9a84c]/10 space-y-4">
                <div className="flex justify-between items-center text-[#e8d5b7]/60 uppercase text-[10px] font-bold tracking-widest">
                  <span>Subtotal</span>
                  <span>${totalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[#e8d5b7]/60 uppercase text-[10px] font-bold tracking-widest">
                  <span>Shipping</span>
                  <span className="text-[#c9a84c]">Calculated Later</span>
                </div>
                <div className="flex justify-between items-center pt-4 text-[#e8d5b7] uppercase tracking-[0.2em] font-bold">
                  <span>Grand Total</span>
                  <span className="text-2xl font-serif text-[#c9a84c]">${totalPrice().toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                {[
                  { icon: ShieldCheck, text: 'Secure handcrafted checkout' },
                  { icon: Truck, text: 'White glove artisanal delivery' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[#e8d5b7]/40">
                    <item.icon size={14} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
