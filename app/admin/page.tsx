import { createClient } from '@/lib/supabase/server'
import { Package, ShoppingCart, TrendingUp, AlertTriangle, ChevronRight, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createClient()

  // KPI calculations (real-time from DB)
  const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
  const { data: orders } = await supabase.from('orders').select('status, total_amount')
  const { data: lowStock } = await supabase.from('products').select('name, stock_quantity').lt('stock_quantity', 5).limit(5)
  const { data: recentOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5)

  const totalOrders = orders?.length || 0
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.status !== 'cancelled' ? Number(o.total_amount) : 0), 0) || 0

  const kpis = [
    { label: 'Total Products', value: productsCount, icon: Package, trend: '+2 this month', color: '#c9a84c' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, trend: '+12% from last week', color: '#2ecc71' },
    { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, trend: '+5% this month', color: '#f39c12' },
    { label: 'Pending Orders', value: pendingOrders, icon: Clock, trend: 'Needs attention', color: '#e74c3c' },
  ]

  return (
    <div className="space-y-16">
      <div className="flex justify-between items-end gap-6">
        <div className="space-y-4">
          <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest">Management Dashboard</span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight">Overview</h1>
        </div>
        <div className="flex gap-4">
          <button className="bg-[#16213e] border border-[#c9a84c]/20 px-8 py-4 text-xs font-bold uppercase tracking-widest hover:border-[#c9a84c] transition">
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-[#16213e] border border-[#c9a84c]/10 p-8 space-y-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a84c]/5 rounded-bl-full translate-x-8 -translate-y-8 group-hover:translate-x-4 group-hover:-translate-y-4 transition duration-500" />
            <div className="flex justify-between items-start relative z-10">
              <kpi.icon size={24} style={{ color: kpi.color }} strokeWidth={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#e8d5b7]/40">{kpi.trend}</span>
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">{kpi.label}</p>
              <h3 className="text-4xl font-serif tracking-tight text-[#e8d5b7]">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-[#16213e]/40 border border-[#c9a84c]/10 p-12 space-y-12 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif text-[#e8d5b7] tracking-wide uppercase tracking-widest">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition">
              View All Orders <ChevronRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-[#c9a84c]/10">
                <tr>
                  <th className="pb-6 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Customer</th>
                  <th className="pb-6 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Status</th>
                  <th className="pb-6 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Total</th>
                  <th className="pb-6 text-[10px] font-bold uppercase tracking-widest text-[#c9a84c]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c9a84c]/5">
                {recentOrders?.map((order) => (
                  <tr key={order.id} className="group">
                    <td className="py-6 pr-6">
                      <div className="flex flex-col">
                        <span className="text-[#e8d5b7] font-serif text-lg tracking-wide">{order.customer_name}</span>
                        <span className="text-[10px] opacity-40 uppercase tracking-widest font-mono">#{order.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow-sm ${
                        order.status === 'pending' ? 'bg-[#f39c12]/20 text-[#f39c12]' :
                        order.status === 'delivered' ? 'bg-[#2ecc71]/20 text-[#2ecc71]' :
                        'bg-[#c9a84c]/20 text-[#c9a84c]'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-6 font-mono text-[#c9a84c] text-sm">${order.total_amount.toLocaleString()}</td>
                    <td className="py-6 text-[10px] uppercase font-bold tracking-widest text-[#e8d5b7]/40">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-[#16213e]/40 border border-[#c9a84c]/10 p-12 space-y-12 backdrop-blur-md">
          <div className="flex items-center gap-4 text-[#e74c3c]">
            <AlertTriangle size={20} strokeWidth={2.5} />
            <h2 className="text-xl font-serif text-[#e8d5b7] tracking-wide uppercase tracking-widest">Inventory Alerts</h2>
          </div>
          <div className="space-y-8">
            {lowStock?.map((product, i) => (
              <div key={i} className="flex justify-between items-end border-b border-[#c9a84c]/10 pb-4 group">
                <div className="space-y-1">
                  <h3 className="text-[#e8d5b7] text-sm font-bold uppercase tracking-widest group-hover:text-[#c9a84c] transition">{product.name}</h3>
                  <p className="text-[10px] text-[#e8d5b7]/40 uppercase tracking-widest font-bold">In stock: <span className="text-[#e74c3c]">{product.stock_quantity}</span></p>
                </div>
                <Link href="/admin/products" className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition pb-1">
                  Restock
                </Link>
              </div>
            ))}
            {lowStock?.length === 0 && (
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#e8d5b7]/30 italic">No low stock items currently.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
