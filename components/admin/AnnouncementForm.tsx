'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { X, Upload, Loader2, Megaphone } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

const announcementSchema = z.object({
  title: z.string().min(5, 'Title is required'),
  body: z.string().min(10, 'Body is required'),
  type: z.enum(['announcement', 'special', 'advert']),
  is_active: z.boolean().default(true),
  expires_at: z.string().optional().nullable(),
})

type AnnouncementFormData = z.infer<typeof announcementSchema>

interface AnnouncementFormProps {
  initialData?: any
  onClose: () => void
  onSuccess: () => void
}

export default function AnnouncementForm({ initialData, onClose, onSuccess }: AnnouncementFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.image_url || null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: initialData || {
      type: 'announcement',
      is_active: true,
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `announcements/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('announcements')
      .upload(filePath, file)

    if (uploadError) {
      toast.error(`Error uploading ${file.name}`)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('announcements')
      .getPublicUrl(filePath)

    setImageUrl(publicUrl)
    setUploading(false)
  }

  const onSubmit = async (data: AnnouncementFormData) => {
    setLoading(true)
    const payload = { ...data, image_url: imageUrl }

    const { error } = initialData
      ? await supabase.from('announcements').update(payload).eq('id', initialData.id)
      : await supabase.from('announcements').insert(payload)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(initialData ? 'Announcement updated' : 'Announcement created')
      onSuccess()
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-[#16213e] border border-[#c9a84c]/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 lg:p-12 relative custom-scrollbar">
        <button onClick={onClose} className="absolute top-8 right-8 text-[#e8d5b7]/40 hover:text-[#c9a84c] transition">
          <X size={24} />
        </button>

        <div className="mb-12 flex items-center gap-6">
          <div className="w-16 h-16 bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
            <Megaphone size={24} strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <span className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-[0.3em]">Communication Portal</span>
            <h2 className="text-3xl font-serif text-[#e8d5b7]">{initialData ? 'Refine Update' : 'New Proclamation'}</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Subject / Title</label>
            <input {...register('title')} className="w-full bg-[#0f3460] border border-[#c9a84c]/10 p-4 text-[#e8d5b7] focus:border-[#c9a84c] outline-none transition font-light" placeholder="Exclusive Collection Launch..." />
            {errors.title && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">The Proclamation (Body)</label>
            <textarea {...register('body')} rows={6} className="w-full bg-[#0f3460] border border-[#c9a84c]/10 p-4 text-[#e8d5b7] focus:border-[#c9a84c] outline-none transition font-light resize-none italic" placeholder="Tell the world about your latest creations or news..." />
            {errors.body && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.body.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Category Type</label>
              <select {...register('type')} className="w-full bg-[#0f3460] border border-[#c9a84c]/10 p-4 text-[#e8d5b7] focus:border-[#c9a84c] outline-none transition uppercase text-[10px] font-bold tracking-widest">
                <option value="announcement">Announcement</option>
                <option value="special">Special Offer</option>
                <option value="advert">Promotion</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Expiry Date (Optional)</label>
              <input type="date" {...register('expires_at')} className="w-full bg-[#0f3460] border border-[#c9a84c]/10 p-4 text-[#e8d5b7] focus:border-[#c9a84c] outline-none transition font-mono uppercase text-[10px]" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Hero Image (Optional)</label>
            <div className="flex gap-6 items-center">
              {imageUrl && (
                <div className="relative w-32 h-32 border border-[#c9a84c]/20 overflow-hidden shadow-2xl">
                  <Image src={imageUrl} alt="Announcement" fill className="object-cover" />
                  <button onClick={() => setImageUrl(null)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded hover:scale-110 transition">
                    <X size={12} />
                  </button>
                </div>
              )}
              <label className="h-32 flex-1 border-2 border-dashed border-[#c9a84c]/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#c9a84c] hover:bg-[#c9a84c]/5 transition">
                {uploading ? <Loader2 size={24} className="animate-spin text-[#c9a84c]" /> : <Upload size={24} className="text-[#c9a84c]/40" />}
                <span className="text-[8px] font-bold uppercase tracking-widest text-[#e8d5b7]/30 mt-2">Upload Visual</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="pt-8 flex gap-6">
            <label className="flex items-center gap-4 cursor-pointer group flex-1">
              <input type="checkbox" {...register('is_active')} className="w-5 h-5 accent-[#c9a84c] bg-[#0f3460] border-[#c9a84c]/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#e8d5b7]/60 group-hover:text-[#c9a84c] transition">Publish Immediately</span>
            </label>
            <div className="flex gap-4 flex-1">
              <button type="button" onClick={onClose} className="flex-1 border border-[#c9a84c]/20 text-[#e8d5b7]/60 py-4 text-[10px] font-bold uppercase tracking-widest hover:text-[#e8d5b7] transition">Cancel</button>
              <button type="submit" disabled={loading} className="flex-2 bg-[#c9a84c] text-[#1a1a2e] px-12 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-[#c9a84c]/20">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {initialData ? 'Update Message' : 'Proclaim News'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
