import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  FileText,
  Download,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
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
import { subDays } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FinanceReport } from '@/components/FinanceReport';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    inventoryValue: 0,
    totalOrders: 0,
    activeProducts: 0,
    ordersCount: { new: 0, pending: 0, completed: 0 }
  });
  const [timeframe, setTimeframe] = useState('Last 7 Days (Real-time)');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        // 1. Parallelize core metrics and summary data
        const [
          recentOrdersRes,
          activeProducts,
          orderCountRes,
          productCountRes,
          lifetimeRevenueRes,
          newOrdersRes,
          pendingOrdersRes,
          completedOrdersRes
        ] = await Promise.all([
          supabase
            .from('orders')
            .select('status, created_at, items:order_items(unit_price_snapshot, quantity)')
            .gte('created_at', thirtyDaysAgo)
            .neq('status', 'cancelled'),
          
          supabase
            .from('products')
            .select('price, stock_quantity')
            .eq('is_published', true),
          
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_published', true),
          
          supabase
            .from('orders')
            .select('items:order_items(unit_price_snapshot, quantity)')
            .eq('status', 'completed'),
            
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'new'),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed')
        ]);

        const { data: recentActivityData } = await supabase
          .from('orders')
          .select('id, customer_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        const allOrders = recentOrdersRes.data || [];
        const lifetimeOrders = lifetimeRevenueRes.data || [];
        
        const calcOrderTotal = (o: any) => o.items?.reduce((sum: number, i: any) => sum + (i.unit_price_snapshot * i.quantity), 0) || 0;
        const lifetimeCollected = lifetimeOrders.reduce((acc: number, o: any) => acc + calcOrderTotal(o), 0) || 0;
        const invValue = activeProducts.data?.reduce((acc: number, p: any) => acc + (p.price * (p.stock_quantity || 0)), 0) || 0;

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const chartData = last7Days.map(date => {
          const dayOrders = allOrders.filter((o: any) => o.created_at.startsWith(date));
          return {
            name: new Date(date).toLocaleDateString('en-NA', { weekday: 'short' }),
            expected: dayOrders.reduce((sum: number, o: any) => sum + calcOrderTotal(o), 0),
            collected: dayOrders.filter((o: any) => o.status === 'completed').reduce((sum: number, o: any) => sum + calcOrderTotal(o), 0)
          };
        });

        setStats({
          totalRevenue: lifetimeCollected,
          inventoryValue: invValue,
          totalOrders: orderCountRes.count || 0,
          activeProducts: productCountRes.count || 0,
          ordersCount: {
            new: newOrdersRes.count || 0,
            pending: pendingOrdersRes.count || 0,
            completed: completedOrdersRes.count || 0
          }
        });
        setRevenueData(chartData);
        setRecentActivity(recentActivityData || []);
      } catch (err) {
        console.error('Dashboard Fetch Error:', err);
        toast.error('Metrics manifesting...');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins} minutes ago`;
    if (diffInMins < 1440) return `${Math.floor(diffInMins/60)} hrs ago`;
    return date.toLocaleDateString();
  };

  const statCards = [
    { label: 'Collected Revenue', value: formatCurrency(stats.totalRevenue), icon: <TrendingUp size={20}/>, color: 'text-success', trend: '+12.5%' },
    { label: 'Inventory Value', value: formatCurrency(stats.inventoryValue), icon: <ArrowUpRight size={20}/>, color: 'text-gold-500', trend: 'Active' },
    { label: 'New Artisan Orders', value: stats.ordersCount.new.toString(), icon: <ShoppingCart size={20}/>, color: 'text-blue-400', trend: 'New' },
    { label: 'Pending Collections', value: stats.ordersCount.pending.toString(), icon: <Package size={20}/>, color: 'text-purple-400', trend: 'Quoted' },
  ];

  if (loading) {
     return (
       <div className="flex items-center justify-center h-screen bg-navy-950">
          <div className="w-12 h-12 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
       </div>
     );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-12"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Executive Overview</h1>
          <p className="text-navy-400 text-sm italic">Live performance metrics for your artisan business.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
           <div className="flex items-center gap-3 bg-navy-900 border border-navy-800 px-4 py-2 rounded-lg">
              <Calendar size={14} className="text-gold-500" />
              <select 
                className="bg-transparent text-[10px] font-bold uppercase tracking-[0.2em] text-navy-400 focus:outline-none"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="Last 7 Days (Real-time)">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Year-to-Date">Year-to-Date</option>
              </select>
           </div>

           <PDFDownloadLink 
             document={<FinanceReport stats={stats} timeframe={timeframe} />} 
             fileName={`Artisan_Ledger_Report_${new Date().toISOString().split('T')[0]}.pdf`}
             className="flex items-center gap-3 bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/20 px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500 transition-all"
           >
             {({ loading }) => (
               <>
                 <Download size={14} />
                 {loading ? 'Preparing Ledger...' : 'Generate High-Fidelity Report'}
               </>
             )}
           </PDFDownloadLink>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="dashboard-card group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 bg-navy-950 rounded-xl ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                {stat.icon}
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                stat.trend.startsWith('+') ? 'border-success/20 text-success' : 'border-error/20 text-error'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-navy-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white tabular-nums">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 dashboard-card min-h-[450px] flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Revenue Progress</h3>
            <div className="flex gap-6">
               <span className="flex items-center gap-2 text-[10px] uppercase font-bold text-navy-400">
                 <div className="w-2 h-2 rounded-full bg-navy-700"/> Expected
               </span>
               <span className="flex items-center gap-2 text-[10px] uppercase font-bold text-gold-500">
                 <div className="w-2 h-2 rounded-full bg-gold-500 shadow-[0_0_8px_rgba(193,155,58,0.4)]"/> Collected
               </span>
            </div>
          </div>
          <div className="flex-1 mt-auto">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e293b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorColl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c19b3a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#c19b3a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#1a1f2e" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#4a5568', fontSize: 10, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{backgroundColor: '#050b18', border: '1px solid #1a1f2e', borderRadius: '12px', fontSize: '11px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'}}
                  itemStyle={{padding: '2px 0'}}
                  cursor={{stroke: '#1a1f2e', strokeWidth: 2}}
                />
                <Area type="monotone" dataKey="expected" stroke="#334155" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                <Area type="monotone" dataKey="collected" stroke="#c19b3a" strokeWidth={3} fillOpacity={1} fill="url(#colorColl)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card min-h-[450px] flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Recent Activity</h3>
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
          <div className="space-y-8 flex-1">
             {recentActivity.length > 0 ? recentActivity.map((order: any) => (
               <div key={order.id} className="flex gap-4 items-start group">
                 <div className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(193,155,58,0.4)] group-hover:scale-125 transition-transform"/>
                 <div className="space-y-1">
                    <p className="text-xs text-navy-100 group-hover:text-white transition-colors leading-relaxed">
                      Order received from <span className="text-gold-500 font-bold">{order.customer_name}</span>
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-navy-400 font-bold">{formatTimeAgo(order.created_at)}</p>
                 </div>
               </div>
             )) : (
               <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                  <ShoppingCart size={40} className="text-navy-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-navy-400">No recent activity detected.</p>
               </div>
             )}
          </div>
          <button className="w-full mt-10 py-3 border border-navy-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-navy-400 hover:text-white hover:border-navy-600 transition-all active:scale-95">
            View All Activity
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
