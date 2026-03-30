import Link from 'next/link'
import { Hammer, Users, ShieldCheck, Heart, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-32 border-b border-[#c9a84c]/10 pb-16">
          <div className="space-y-6">
            <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest">Our Legacy</span>
            <h1 className="text-6xl md:text-9xl font-serif tracking-tight leading-none">Space2Standard</h1>
          </div>
          <p className="text-[#e8d5b7]/50 font-light max-w-xl text-lg md:text-2xl leading-relaxed italic">
            Defining artisanal excellence in luxury carpentry, one masterpiece at a time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative aspect-[4/5] bg-[#16213e] border border-[#c9a84c]/10 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[#0f3460] opacity-10" />
            <div className="absolute inset-12 border border-[#c9a84c]/20 flex flex-col items-center justify-center text-center p-12">
              <Hammer className="text-[#c9a84c] mb-8" size={64} strokeWidth={1} />
              <h2 className="text-3xl font-serif text-[#e8d5b7] mb-4">Artisanal Workshop</h2>
              <p className="text-xs uppercase tracking-widest text-[#c9a84c] font-bold">EST. 1998</p>
            </div>
          </div>
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-serif tracking-tight">Craftsmanship with a Soul</h2>
              <p className="text-[#e8d5b7]/70 leading-relaxed font-light text-lg">
                At Space2Standard, we believe that wood is more than just a material—it's a story waiting to be told.
                Our team of master carpenters combines decades of traditional experience with modern precision,
                creating furniture and installations that transcend time and trends.
              </p>
              <p className="text-[#e8d5b7]/70 leading-relaxed font-light text-lg">
                Every joint, every grain, and every finish is meticulously handled to ensure that your space
                reflects the standard of excellence you deserve.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-[#c9a84c]/10">
              {[
                { icon: Users, title: 'Bespoke Design', desc: 'Custom tailored to your vision.' },
                { icon: ShieldCheck, title: 'Ethical Sourcing', desc: 'Sustainably harvested premium wood.' },
                { icon: Heart, title: 'Passionate Work', desc: 'Crafted with heart and soul.' },
                { icon: Hammer, title: 'Precision Engineering', desc: 'Perfectly executed details.' },
              ].map((val, i) => (
                <div key={i} className="space-y-4">
                  <val.icon className="text-[#c9a84c]" size={28} strokeWidth={1.5} />
                  <h3 className="text-xl font-serif tracking-wide">{val.title}</h3>
                  <p className="text-xs opacity-50 uppercase leading-relaxed tracking-wider font-bold">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-40 bg-[#16213e]/40 border border-[#c9a84c]/10 p-20 text-center space-y-12 backdrop-blur-md">
          <h2 className="text-4xl md:text-7xl font-serif tracking-tight leading-tight max-w-4xl mx-auto italic">
            Experience the <span className="text-[#c9a84c]">art of living</span> well
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
            <Link href="/products" className="text-xs font-bold uppercase tracking-[0.3em] text-[#c9a84c] hover:opacity-70 transition flex items-center gap-4">
              Browse Collection <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="text-xs font-bold uppercase tracking-[0.3em] text-[#e8d5b7] hover:text-[#c9a84c] transition flex items-center gap-4">
              Get in Touch <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
