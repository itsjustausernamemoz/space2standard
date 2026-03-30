import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Megaphone, ChevronRight, Calendar, Tag, ArrowRight } from 'lucide-react'

export default async function PublicAnnouncementsPage() {
  const supabase = createClient()
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-32 pb-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="space-y-4 text-center md:text-left">
            <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest">Latest Updates</span>
            <h1 className="text-5xl md:text-8xl font-serif tracking-tight leading-none">News & Specials</h1>
          </div>
          <p className="text-[#e8d5b7]/50 font-light max-w-sm text-sm uppercase tracking-widest leading-loose">
            Keep up to date with our newest collections and exclusive artisanal offers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {announcements?.map((ann) => (
            <div key={ann.id} className="bg-[#16213e]/40 border border-[#c9a84c]/10 p-12 md:p-20 relative group overflow-hidden backdrop-blur-md flex flex-col md:flex-row gap-16 items-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a84c]/5 rounded-bl-full translate-x-32 -translate-y-32 group-hover:translate-x-24 group-hover:-translate-y-24 transition duration-700" />

              <div className="space-y-8 flex-1 relative z-10">
                <div className="flex items-center gap-6">
                  <div className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 border ${
                    ann.type === 'special' ? 'border-[#c9a84c] text-[#c9a84c]' : 'border-[#e8d5b7]/20 text-[#e8d5b7]'
                  }`}>
                    {ann.type}
                  </div>
                  {ann.expires_at && (
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#e8d5b7]/40">
                      <Calendar size={14} strokeWidth={2} />
                      Until {new Date(ann.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <h2 className="text-4xl md:text-6xl font-serif tracking-tight leading-tight group-hover:text-[#c9a84c] transition duration-500">
                  {ann.title}
                </h2>

                <p className="text-lg md:text-xl font-light opacity-70 leading-relaxed max-w-2xl italic">
                  {ann.body}
                </p>

                <div className="pt-8">
                  <Link href="/products" className="inline-flex items-center gap-4 text-xs font-bold uppercase tracking-[0.3em] text-[#c9a84c] group-hover:gap-8 transition-all duration-500">
                    Explore Collection <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {ann.image_url && (
                <div className="relative w-full md:w-80 aspect-square border border-[#c9a84c]/10 overflow-hidden shadow-2xl">
                  <img src={ann.image_url} alt={ann.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                </div>
              )}
            </div>
          ))}
          {(!announcements || announcements.length === 0) && (
            <div className="text-center py-40 border border-[#c9a84c]/10 bg-[#16213e]/20 backdrop-blur-md">
              <Megaphone size={64} className="mx-auto mb-8 text-[#c9a84c]/5" strokeWidth={1} />
              <h2 className="text-2xl font-serif text-[#e8d5b7]/50 tracking-widest uppercase">No announcements at this time</h2>
              <Link href="/" className="text-[#c9a84c] mt-8 inline-block underline underline-offset-8 uppercase text-xs font-bold tracking-widest">
                Return to Artisan Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
