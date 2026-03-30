import { createClient } from '@/lib/supabase/server'
import { ShoppingCart, Search, Filter, Eye, ChevronRight, CheckCircle2, Truck, Clock, AlertTriangle, XCircle, Hammer } from 'lucide-react'
import Link from 'next/link'

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle2,
  in_production: Hammer,
  ready: Package,
  delivered: Truck,
  cancelled: XCircle,
}

const statusColors = {
  pending: '#f39c12',
  confirmed: '#c9a84c',
  in_production: '#c9a84c',
  ready: '#2ecc71',
  delivered: '#2ecc71',
  cancelled: '#e74c3c',
}

export default async function AdminOrdersPage() {
  const supabase = createClient()
  const { data: orders } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })

  return (
    <div className="space-y-16 pb-20">
      <div className="flex justify-between items-end gap-6">
        <div className="space-y-4">
          <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest">Client Management</span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight">Orders</h1>
        </div>
        <div className="flex gap-4">
          <button className="bg-[#16213e] border border-[#c9a84c]/20 px-8 py-4 text-xs font-bold uppercase tracking-widest hover:border-[#c9a84c] transition flex items-center gap-3">
            <Filter size={14} /> Filter Status
          </button>
        </div>
      </div>

      <div className="bg-[#16213e]/40 border border-[#c9a84c]/10 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#16213e] border-b border-[#c9a84c]/10">
              <tr>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Order ID</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Client Detail</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Items Count</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Total Amount</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Order Status</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c9a84c]/5">
              {orders?.map((order) => (
                <tr key={order.id} className="group hover:bg-[#c9a84c]/5 transition duration-300">
                  <td className="p-8">
                    <span className="text-[10px] opacity-40 uppercase tracking-widest font-mono group-hover:text-[#c9a84c] transition duration-300">#{order.id.slice(0, 8)}</span>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#e8d5b7] font-serif text-xl tracking-wide">{order.customer_name}</span>
                      <span className="text-[10px] opacity-40 uppercase tracking-widest font-mono">{order.customer_email}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="text-sm font-mono font-bold text-[#e8d5b7] bg-[#0f3460] px-3 py-1 border border-[#c9a84c]/10 rounded shadow-inner">
                      {order.order_items?.length || 0} Products
                    </span>
                  </td>
                  <td className="p-8">
                    <span className="text-[#c9a84c] font-mono text-sm font-bold">${order.total_amount.toLocaleString()}</span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: statusColors[order.status as keyof typeof statusColors] }} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{order.status.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <button className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-widest border border-[#c9a84c]/20 px-6 py-3 hover:bg-[#c9a84c] hover:text-[#1a1a2e] transition shadow-lg flex items-center gap-2">
                      <Eye size={12} /> Manage Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!orders || orders.length === 0) && (
            <div className="text-center py-40 border-t border-[#c9a84c]/10">
              <ShoppingCart size={48} className="mx-auto mb-6 text-[#c9a84c]/10" strokeWidth={1} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#e8d5b7]/30 italic">No orders received yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Package(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  )
}
