import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ChevronRight, ShoppingCart, Share2, Ruler, ShieldCheck, Truck } from 'lucide-react'
import AddToCartButton from '@/components/public/AddToCartButton'
import ProductGallery from '@/components/public/ProductGallery'

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!product) {
    notFound()
  }

  // Fetch related products from same category
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', product.id)
    .limit(4)

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-32 pb-20">
      <div className="container mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-12">
          <Link href="/" className="opacity-50 hover:opacity-100 transition">Home</Link>
          <ChevronRight size={12} className="opacity-30" />
          <Link href="/products" className="opacity-50 hover:opacity-100 transition">Collection</Link>
          <ChevronRight size={12} className="opacity-30" />
          <span className="text-[#e8d5b7]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
          {/* Gallery Section */}
          <div className="space-y-6">
            <ProductGallery images={product.images || []} />
          </div>

          {/* Details Section */}
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex justify-between items-center gap-4">
                <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-[0.2em]">{product.category || 'Collection'}</span>
                <button className="text-[#e8d5b7] hover:text-[#c9a84c] transition"><Share2 size={18} /></button>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-[#e8d5b7]">
                {product.name}
              </h1>
              <div className="flex items-center gap-6">
                <span className="text-3xl md:text-5xl font-serif text-[#c9a84c] font-bold">
                  ${product.discounted_price.toLocaleString()}
                </span>
                {product.discount_percent && product.discount_percent > 0 && (
                  <div className="flex flex-col">
                    <span className="text-[#e8d5b7]/30 line-through text-sm font-mono tracking-widest uppercase">
                      ${product.price.toLocaleString()}
                    </span>
                    <span className="text-[#c9a84c] text-[10px] font-bold tracking-[0.2em] uppercase mt-1">
                      -{product.discount_percent}% Save
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[#e8d5b7]/70 leading-relaxed font-light text-lg">
                {product.description || 'No description provided for this exquisite piece.'}
              </p>
            </div>

            <div className="pt-8 border-t border-[#c9a84c]/10 space-y-8">
              <AddToCartButton product={product} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                {[
                  { icon: Ruler, title: 'Bespoke Size', desc: 'Crafted to fit your space perfectly.' },
                  { icon: ShieldCheck, title: 'Lifetime Care', desc: 'Quality that stands the test of time.' },
                  { icon: Truck, title: 'White Glove', desc: 'Expert delivery and assembly.' },
                ].map((feature, i) => (
                  <div key={i} className="space-y-3">
                    <feature.icon className="text-[#c9a84c]" size={20} strokeWidth={1} />
                    <h3 className="text-xs font-bold uppercase tracking-widest">{feature.title}</h3>
                    <p className="text-[10px] opacity-50 uppercase leading-relaxed tracking-wider font-semibold">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-40 space-y-16">
            <div className="text-center space-y-4">
              <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest">More From Collection</span>
              <h2 className="text-4xl md:text-6xl font-serif tracking-tight">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <div key={p.id} className="relative group overflow-hidden border border-[#c9a84c]/10 aspect-[3/4]">
                  <Image src={p.images?.[0] || '/placeholder.jpg'} alt={p.name} fill className="object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-[#1a1a2e]/60 opacity-0 group-hover:opacity-100 transition duration-500 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <h3 className="text-xl font-serif tracking-wide">{p.name}</h3>
                    <Link href={`/products/${p.id}`} className="text-xs font-bold uppercase tracking-widest border-b border-[#c9a84c] pb-2 text-[#c9a84c]">View Detail</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
