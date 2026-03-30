'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { X, Upload, Plus, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.string().min(2, 'Category is required'),
  price: z.coerce.number().positive('Price must be positive'),
  stock_quantity: z.coerce.number().int().nonnegative('Stock cannot be negative'),
  discount_percent: z.coerce.number().min(0).max(100).default(0),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  initialData?: any
  onClose: () => void
  onSuccess: () => void
}

export default function ProductForm({ initialData, onClose, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      is_active: true,
      is_featured: false,
      discount_percent: 0,
    },
  })

  const price = watch('price') || 0
  const discount = watch('discount_percent') || 0
  const discountedPrice = price - (price * discount / 100)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newImages = [...images]

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `product-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) {
        toast.error(`Error uploading ${file.name}`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      newImages.push(publicUrl)
    }

    setImages(newImages)
    setUploading(false)
  }

  const removeImage = (url: string) => {
    setImages(images.filter((img) => img !== url))
  }

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    const payload = { ...data, images }

    const { error } = initialData
      ? await supabase.from('products').update(payload).eq('id', initialData.id)
      : await supabase.from('products').insert(payload)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(initialData ? 'Product updated' : 'Product created')
      onSuccess()
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="bg-[#16213e] border border-[#c9a84c]/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 lg:p-12 relative custom-scrollbar">
        <button onClick={onClose} className="absolute top-8 right-8 text-[#e8d5b7]/40 hover:text-[#c9a84c] transition">
          <X size={24} />
        </button>

        <div className="mb-12">
          <span className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-[0.3em]">Artisan Inventory</span>
          <h2 className="text-4xl font-serif text-[#e8d5b7]">{initialData ? 'Refine Masterpiece' : 'Forge New Piece'}</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Product Name</label>
              <input {...register('name')} className="w-full bg-[#0f3460] border border-[#c9a84c]/10 p-4 text-[#e8d5b7] focus:border-[#c9a84c] outline-none transition font-light" />
              {errors.name && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Description</label>
              <textarea {...register('description')} rows={4} className="w-full bg-[#0f3460] border border-[#c9a84c]/10 p-4 text-[#e8d5b7] focus:border-[#c9a84c] outline-none transition font-light resize-none" />
              {errors.description && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Category</label>
                <input {...register('category')} className="w-full bg-[#0f3460] border border-[#c9a84c]/10 p-4 text-[#e8d5b7] focus:border-[#c9a84c] outline-none transition font-light" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Stock Quantity</label>
                <input type="number" {...register('stock_quantity')} className="w-full bg-[#0f3460] border border-[#c9a84c]/10 p-4 text-[#e8d5b7] focus:border-[#c9a84c] outline-none transition font-mono" />
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <label className="flex items-center gap-4 cursor-pointer group">
                <input type="checkbox" {...register('is_featured')} className="w-5 h-5 accent-[#c9a84c] bg-[#0f3460] border-[#c9a84c]/20" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#e8d5b7]/60 group-hover:text-[#c9a84c] transition">Feature on Home Page</span>
              </label>
              <label className="flex items-center gap-4 cursor-pointer group">
                <input type="checkbox" {...register('is_active')} className="w-5 h-5 accent-[#c9a84c] bg-[#0f3460] border-[#c9a84c]/20" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#e8d5b7]/60 group-hover:text-[#c9a84c] transition">Active in Collection</span>
              </label>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#0f3460]/50 p-8 border border-[#c9a84c]/5 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Base Price ($)</label>
                  <input type="number" step="0.01" {...register('price')} className="w-full bg-[#0f3460] border border-[#c9a84c]/20 p-4 text-[#c9a84c] font-mono text-xl focus:border-[#c9a84c] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Discount (%)</label>
                  <input type="number" {...register('discount_percent')} className="w-full bg-[#0f3460] border border-[#c9a84c]/20 p-4 text-[#e8d5b7] font-mono text-xl focus:border-[#c9a84c] outline-none" />
                </div>
              </div>
              <div className="pt-4 border-t border-[#c9a84c]/10 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#e8d5b7]/40">Live Preview Price:</span>
                <span className="text-2xl font-serif text-[#c9a84c]">${discountedPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Product Gallery</label>
              <div className="grid grid-cols-4 gap-4">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square border border-[#c9a84c]/20 group overflow-hidden">
                    <Image src={url} alt="Product" fill className="object-cover group-hover:scale-110 transition duration-500" />
                    <button onClick={() => removeImage(url)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed border-[#c9a84c]/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#c9a84c] hover:bg-[#c9a84c]/5 transition">
                  {uploading ? <Loader2 size={24} className="animate-spin text-[#c9a84c]" /> : <Upload size={24} className="text-[#c9a84c]/40" />}
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#e8d5b7]/30 mt-2">Upload</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="pt-8 flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 border border-[#c9a84c]/20 text-[#e8d5b7]/60 py-4 text-[10px] font-bold uppercase tracking-widest hover:text-[#e8d5b7] transition">Cancel</button>
              <button type="submit" disabled={loading} className="flex-2 bg-[#c9a84c] text-[#1a1a2e] px-12 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-3">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {initialData ? 'Refine Masterpiece' : 'Forge Piece'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
