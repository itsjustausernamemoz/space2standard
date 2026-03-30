import Hero3D from '@/components/public/Hero3D'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="relative bg-[#1a1a2e] text-[#e8d5b7] min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20 px-6">
        <Hero3D />

        <div className="relative z-10 text-center max-w-5xl mx-auto space-y-12">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-serif tracking-tight leading-none">
              Space2Standard
            </h1>
            <p className="text-lg md:text-2xl font-light uppercase tracking-[0.4em] text-[#c9a84c]">
              Crafted to Perfection. Built to Last.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/products"
              className="bg-[#c9a84c] text-[#1a1a2e] px-10 py-5 text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition shadow-xl shadow-[#c9a84c]/20"
            >
              Explore Products
            </Link>
            <Link
              href="/order"
              className="border border-[#c9a84c] text-[#c9a84c] px-10 py-5 text-sm font-bold uppercase tracking-widest hover:bg-[#c9a84c] hover:text-[#1a1a2e] transition"
            >
              Order Now
            </Link>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <div className="w-[1px] h-20 bg-gradient-to-b from-transparent to-[#c9a84c]" />
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-32 px-6 container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="space-y-4">
            <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest">Our Collection</span>
            <h2 className="text-4xl md:text-6xl font-serif tracking-tight">Masterpieces</h2>
          </div>
          <Link href="/products" className="text-[#c9a84c] flex items-center gap-2 hover:gap-4 transition-all uppercase text-xs font-bold tracking-widest pb-2 border-b border-[#c9a84c]/20">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group relative bg-[#16213e] aspect-[4/5] border border-[#c9a84c]/10 overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-[#0f3460] opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-widest mb-2">Furniture</p>
                <h3 className="text-2xl font-serif tracking-wide text-[#e8d5b7] mb-4">Artisan Table {i}</h3>
                <Link href={`/products/${i}`} className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  Details <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="py-32 bg-[#16213e]/50 border-y border-[#c9a84c]/5">
        <div className="container mx-auto px-6 text-center space-y-24">
          <div className="space-y-4">
            <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest">How It Works</span>
            <h2 className="text-4xl md:text-6xl font-serif tracking-tight">From Tree to Table</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { title: 'Browse', desc: 'Select from our curated collections or request a custom design.', icon: '01' },
              { title: 'Order', desc: 'Securely place your order through our streamlined platform.', icon: '02' },
              { title: 'Deliver', desc: 'Expertly crafted and delivered with the utmost care to your door.', icon: '03' },
            ].map((step, idx) => (
              <div key={idx} className="relative space-y-6 group">
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 text-8xl font-serif text-[#c9a84c]/5 group-hover:text-[#c9a84c]/10 transition">
                  {step.icon}
                </span>
                <div className="relative z-10 w-16 h-16 bg-[#c9a84c]/10 border border-[#c9a84c]/20 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="text-[#c9a84c]" size={24} strokeWidth={1} />
                </div>
                <h3 className="text-xl font-serif tracking-wide">{step.title}</h3>
                <p className="text-sm opacity-60 leading-relaxed font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 container mx-auto text-center space-y-12">
        <h2 className="text-4xl md:text-7xl font-serif tracking-tight leading-tight max-w-4xl mx-auto">
          Elevate your living space with <span className="text-[#c9a84c] italic">excellence</span>
        </h2>
        <Link
          href="/contact"
          className="inline-block bg-[#c9a84c] text-[#1a1a2e] px-12 py-6 text-sm font-bold uppercase tracking-[0.2em] hover:bg-opacity-90 transition-all"
        >
          Consult an Artisan
        </Link>
      </section>
    </main>
  )
}
