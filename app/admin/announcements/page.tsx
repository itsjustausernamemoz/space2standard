import { createClient } from '@/lib/supabase/server'
import { Megaphone, Plus, Search, Eye, EyeOff, Edit, Trash2, Calendar, Tag } from 'lucide-react'
import Image from 'next/image'

export default async function AdminAnnouncementsPage() {
  const supabase = createClient()
  const { data: announcements } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-16 pb-20">
      <div className="flex justify-between items-end gap-6">
        <div className="space-y-4">
          <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest">Promotion Management</span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight">Announcements</h1>
        </div>
        <div className="flex gap-4">
          <button className="bg-[#c9a84c] text-[#1a1a2e] px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition shadow-xl shadow-[#c9a84c]/20 flex items-center gap-3">
            <Plus size={16} /> Create New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {announcements?.map((ann) => (
          <div key={ann.id} className="bg-[#16213e] border border-[#c9a84c]/10 p-8 space-y-8 relative group overflow-hidden shadow-2xl">
            <div className="flex justify-between items-start">
              <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow-sm flex items-center gap-2 ${
                ann.type === 'special' ? 'bg-[#c9a84c]/20 text-[#c9a84c]' : 'bg-[#e8d5b7]/10 text-[#e8d5b7]'
              }`}>
                <Tag size={10} /> {ann.type}
              </div>
              <div className="flex gap-4">
                <button className="text-[#e8d5b7]/40 hover:text-[#c9a84c] transition"><Edit size={16} /></button>
                <button className="text-[#e8d5b7]/40 hover:text-red-500 transition"><Trash2 size={16} /></button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-serif text-[#e8d5b7] tracking-wide leading-tight group-hover:text-[#c9a84c] transition duration-300">
                {ann.title}
              </h3>
              <p className="text-sm opacity-60 font-light leading-relaxed line-clamp-3 italic">
                {ann.body}
              </p>
            </div>

            <div className="pt-6 border-t border-[#c9a84c]/10 flex justify-between items-center">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[#e8d5b7]/30">
                <Calendar size={14} />
                {ann.expires_at ? new Date(ann.expires_at).toLocaleDateString() : 'No expiry'}
              </div>
              <button className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${ann.is_active ? 'text-[#2ecc71]' : 'text-[#e8d5b7]/30'}`}>
                {ann.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                {ann.is_active ? 'Visible' : 'Draft'}
              </button>
            </div>
          </div>
        ))}
        {(!announcements || announcements.length === 0) && (
          <div className="lg:col-span-3 text-center py-40 border border-[#c9a84c]/10 bg-[#16213e]/20 backdrop-blur-md">
            <Megaphone size={48} className="mx-auto mb-6 text-[#c9a84c]/10" strokeWidth={1} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#e8d5b7]/30">No active announcements</p>
          </div>
        )}
      </div>
    </div>
  )
}
