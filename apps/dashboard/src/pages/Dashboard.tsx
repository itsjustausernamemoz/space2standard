import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency } from '@shared/utils';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    activeProducts: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock data for charts - in a real app these would be fetched
  const revenueData = [
    { name: 'Mon', value: 45000 },
    { name: 'Tue', value: 52000 },
    { name: 'Wed', value: 48000 },
    { name: 'Thu', value: 61000 },
    { name: 'Fri', value: 55000 },
    { name: 'Sat', value: 67000 },
    { name: 'Sun', value: 72000 },
  ];

  useEffect(() => {
    async function fetchStats() {
      // 1. Get total revenue from completed orders
      const { data: orders } = await supabase
        .from('orders')
        .select(`*, items:order_items(*)`)
        .eq('status', 'completed');
      
      const revenue = orders?.reduce((acc, order) => {
          const total = order.items.reduce((sum: number, item: any) => sum + (item.unit_price_snapshot * item.quantity), 0);
          return acc + total;
      }, 0) || 0;

      // 2. Get total orders
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // 3. Get active products
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      setStats({
        totalRevenue: revenue,
        totalOrders: orderCount || 0,
        avgOrderValue: orderCount ? (revenue / (orders?.length || 1)) : 0,
        activeProducts: productCount || 0
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: <TrendingUp size={20}/>, color: 'text-success', trend: '+12.5%' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: <ShoppingCart size={20}/>, color: 'text-blue-400', trend: '+5.2%' },
    { label: 'Avg. Order Value', value: formatCurrency(stats.avgOrderValue), icon: <Users size={20}/>, color: 'text-purple-400', trend: '-2.1%' },
    { label: 'Active Products', value: stats.activeProducts.toString(), icon: <Package size={20}/>, color: 'text-gold-500', trend: '+3' },
  ];

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Executive Overview</h1>
          <p className="text-charcoal-500 text-sm">Monitor your artisan business at a glance.</p>
        </div>
        <div className="flex gap-4">
           {/* Date Range Picker Placeholder */}
           <div className="bg-charcoal-800 border border-charcoal-700 px-4 py-2 rounded-lg text-xs font-medium text-charcoal-400">
             Last 7 Days
           </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="dashboard-card group hover:border-gold-500/20 transition-all duration-500">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 bg-charcoal-900 rounded-xl ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                {stat.icon}
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                stat.trend.startsWith('+') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
              }`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                {stat.trend}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-charcoal-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 dashboard-card h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Revenue Progress</h3>
            <div className="flex gap-4">
               <span className="flex items-center gap-2 text-[10px] uppercase font-bold text-success">
                 <div className="w-2 h-2 rounded-full bg-success"/> Expected
               </span>
               <span className="flex items-center gap-2 text-[10px] uppercase font-bold text-gold-500">
                 <div className="w-2 h-2 rounded-full bg-gold-500"/> Collected
               </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#c9a84c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a2a"/>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#5a5a5a', fontSize: 12}} dy={10}/>
              <YAxis hide />
              <Tooltip 
                contentStyle={{backgroundColor: '#121212', border: '1px solid #2a2a2a', borderRadius: '8px', fontSize: '12px'}}
                itemStyle={{color: '#c9a84c'}}
              />
              <Area type="monotone" dataKey="value" stroke="#c9a84c" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-8">Recent Activity</h3>
          <div className="space-y-8">
             {/* Activity Feed Placeholder */}
             {[1,2,3,4].map(i => (
               <div key={i} className="flex gap-4 items-start">
                 <div className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 shrink-0 shadow-lg shadow-gold-500/40"/>
                 <div className="space-y-1">
                    <p className="text-sm text-cream-100/80 leading-snug">New order received from <span className="text-white font-medium">Marc Jacobs</span></p>
                    <p className="text-[10px] uppercase tracking-widest text-charcoal-500 font-bold">12 minutes ago</p>
                 </div>
               </div>
             ))}
          </div>
          <button className="w-full mt-12 py-3 border border-charcoal-700 rounded-lg text-xs font-bold uppercase tracking-widest text-charcoal-400 hover:text-white hover:border-charcoal-600 transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};
