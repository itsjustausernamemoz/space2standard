import { createClient } from '@/lib/supabase/server'
import { Package, Plus, Search, Filter, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function AdminProductsPage() {
  const supabase = createClient()
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-16 pb-20">
      <div className="flex justify-between items-end gap-6">
        <div className="space-y-4">
          <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest">Inventory Management</span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight">Collection</h1>
        </div>
        <div className="flex gap-4">
          <button className="bg-[#16213e] border border-[#c9a84c]/20 px-8 py-4 text-xs font-bold uppercase tracking-widest hover:border-[#c9a84c] transition flex items-center gap-3">
            <Filter size={14} /> Filter
          </button>
          <button className="bg-[#c9a84c] text-[#1a1a2e] px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition shadow-xl shadow-[#c9a84c]/20 flex items-center gap-3">
            <Plus size={16} /> New Product
          </button>
        </div>
      </div>

      <div className="relative mb-12">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#c9a84c]" size={18} strokeWidth={2.5} />
        <input
          type="text"
          placeholder="Search within collection..."
          className="w-full bg-[#16213e] border border-[#c9a84c]/10 py-6 pl-16 pr-6 text-sm uppercase tracking-widest font-bold focus:outline-none focus:border-[#c9a84c] transition"
        />
      </div>

      <div className="bg-[#16213e]/40 border border-[#c9a84c]/10 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#16213e] border-b border-[#c9a84c]/10">
              <tr>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Image</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Product Name</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Category</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Price</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Stock</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Status</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c9a84c]/5">
              {products?.map((product) => (
                <tr key={product.id} className="group hover:bg-[#c9a84c]/5 transition duration-300">
                  <td className="p-8">
                    <div className="relative w-16 h-16 bg-[#0f3460] border border-[#c9a84c]/10 group-hover:scale-110 transition duration-500">
                      {product.images?.[0] && (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#e8d5b7] font-serif text-xl tracking-wide">{product.name}</span>
                      {product.is_featured && <span className="text-[8px] text-[#c9a84c] uppercase font-bold tracking-widest border border-[#c9a84c]/20 px-2 py-0.5 w-fit">Featured Piece</span>}
                    </div>
                  </td>
                  <td className="p-8 text-[10px] uppercase font-bold tracking-widest text-[#e8d5b7]/50">{product.category}</td>
                  <td className="p-8">
                    <div className="flex flex-col">
                      <span className="text-[#c9a84c] font-mono text-sm font-bold">${product.discounted_price.toLocaleString()}</span>
                      {product.discount_percent > 0 && <span className="text-[10px] text-[#e8d5b7]/30 line-through font-mono">-${product.price.toLocaleString()}</span>}
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`text-sm font-mono font-bold ${product.stock_quantity < 5 ? 'text-red-500' : 'text-[#e8d5b7]'}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="p-8">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 ${product.is_active ? 'text-[#2ecc71]' : 'text-[#e8d5b7]/30'}`}>
                      {product.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex gap-4">
                      <button className="text-[#e8d5b7]/40 hover:text-[#c9a84c] transition"><Edit size={18} strokeWidth={1.5} /></button>
                      <button className="text-[#e8d5b7]/40 hover:text-red-500 transition"><Trash2 size={18} strokeWidth={1.5} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!products || products.length === 0) && (
            <div className="text-center py-40 border-t border-[#c9a84c]/10">
              <Package size={48} className="mx-auto mb-6 text-[#c9a84c]/10" strokeWidth={1} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#e8d5b7]/30">The collection is currently empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
