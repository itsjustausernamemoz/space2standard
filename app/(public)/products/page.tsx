import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import ProductCard from '@/components/public/ProductCard'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  if (searchParams.sort === 'price-asc') {
    query = query.order('discounted_price', { ascending: true })
  } else if (searchParams.sort === 'price-desc') {
    query = query.order('discounted_price', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: products } = await query

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#c9a84c] text-xs font-bold uppercase tracking-widest">
              <Link href="/" className="opacity-50 hover:opacity-100 transition">Home</Link>
              <ChevronRight size={12} className="opacity-30" />
              <span>Collection</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif tracking-tight">Our Collection</h1>
          </div>
          <div className="flex gap-4">
            {/* Simple Sort Select */}
            <select className="bg-[#16213e] border border-[#c9a84c]/20 text-[#e8d5b7] text-xs font-bold uppercase tracking-widest px-4 py-3 focus:outline-none focus:border-[#c9a84c]">
              <option value="newest">Newest First</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
            </select>
          </div>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 border border-[#c9a84c]/10 bg-[#16213e]/30">
            <ShoppingBag size={48} className="mx-auto mb-6 text-[#c9a84c]/20" strokeWidth={1} />
            <h2 className="text-2xl font-serif text-[#e8d5b7]/50">No products found in this category</h2>
            <Link href="/products" className="text-[#c9a84c] mt-4 inline-block underline underline-offset-8 uppercase text-xs font-bold tracking-widest">
              Back to all products
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
