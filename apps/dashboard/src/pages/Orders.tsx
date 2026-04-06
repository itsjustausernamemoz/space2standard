import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@shared/types';
import { 
  formatCurrency, 
  getOrderStatusLabel, 
  getOrderStatusColor,
  formatDate
} from '@shared/utils';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  Mail, 
  Phone, 
  Clock,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`*, items:order_items(*)`)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch orders');
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }

  const updateStatus = async (id: string, status: OrderStatus) => {
    // If transitioning to completed, atomize the update via RPC to decrement inventory
    if (status === 'completed') {
       if (!window.confirm("Marking this complete will permanently deduct the materials from inventory. Proceed?")) return;
       const { error } = await supabase.rpc('mark_order_completed', { target_order_id: id });
       if (error) {
         toast.error('Failed to trigger fulfillment synchronization');
         return;
       }
       setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
       toast.success("Order fulfilled and inventory decremented.");
       return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      toast.success(`Order status updated to ${status}`);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Order Management</h1>
          <p className="text-charcoal-500 text-sm">Track artisan orders and customer inquiries.</p>
        </div>
        <div className="bg-charcoal-800 border border-charcoal-700/50 rounded-lg px-6 py-3 text-xs font-bold uppercase tracking-widest text-gold-500 shadow-xl">
           {orders.filter(o => o.status === 'new').length} New Inquiries
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-500" />
           <input 
             type="text" 
             placeholder="Search customer, email or order ID..." 
             className="input-base pl-12"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex gap-2">
           <div className="bg-charcoal-800 border border-charcoal-700/50 rounded-lg p-1.5 flex gap-1">
              {['all', 'new', 'contacted', 'in_progress', 'completed', 'cancelled'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s as any)}
                  className={`px-4 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${
                    statusFilter === s ? 'bg-gold-500 text-charcoal-950' : 'text-charcoal-500 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-card p-0 overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-charcoal-950/50 text-[10px] uppercase font-bold tracking-[0.2em] text-charcoal-500 border-b border-charcoal-800">
                <th className="px-8 py-5">Customer & Details</th>
                <th className="px-8 py-5">Value</th>
                <th className="px-8 py-5">Date Received</th>
                <th className="px-8 py-5">Current Status</th>
                <th className="px-8 py-5 text-right">Progress Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8 h-20 bg-charcoal-900/50" />
                  </tr>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((o) => {
                  const total = o.items?.reduce((sum, item) => sum + (item.unit_price_snapshot * item.quantity), 0) || 0;
                  return (
                    <tr key={o.id} className="group hover:bg-charcoal-800/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="space-y-4">
                           <div className="space-y-1">
                             <p className="text-sm font-semibold text-white group-hover:text-gold-400 transition-colors">{o.customer_name}</p>
                             <p className="text-[10px] text-charcoal-500 uppercase tracking-widest leading-none">Order ID: {o.id.slice(0,8)}</p>
                           </div>
                           <div className="flex gap-4 text-[10px] uppercase font-bold text-charcoal-600 tracking-widest">
                              <span className="flex items-center gap-1"><Mail size={12}/> {o.customer_email}</span>
                              {o.customer_phone && <span className="flex items-center gap-1"><Phone size={12}/> {o.customer_phone}</span>}
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-white tracking-wide">{formatCurrency(total)}</span>
                        <p className="text-[10px] text-charcoal-600 mt-1 uppercase font-bold">{o.items?.length || 0} Piece(s)</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-medium text-cream-100/60 font-inter">
                           <Clock size={14} className="text-charcoal-500" />
                           {formatDate(o.created_at)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getOrderStatusColor(o.status)}`}>
                          {getOrderStatusLabel(o.status)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3 items-center">
                           <select 
                             className={`bg-charcoal-900 border border-charcoal-750 text-[10px] font-bold uppercase tracking-widest text-charcoal-400 rounded px-3 py-1.5 focus:outline-none focus:border-gold-500 ${o.status !== 'completed' ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                             value={o.status}
                             disabled={o.status === 'completed'}
                             onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                           >
                             <option value="new">New</option>
                             <option value="contacted">Contacted</option>
                             <option value="in_progress">Processing</option>
                             <option value="completed">Completed</option>
                             <option value="cancelled">Cancelled</option>
                           </select>
                           
                            {/* Quick Actions */}
                           <button 
                             onClick={() => navigate(`/invoices/new?orderId=${o.id}`)}
                             className="p-2 bg-charcoal-800 rounded-lg text-gold-500 hover:bg-gold-500 hover:text-charcoal-950 transition-all shadow-lg"
                             title="Issue Invoice"
                           >
                              <FileText size={16} />
                           </button>
                           
                           <button className="p-2 bg-charcoal-800 rounded-lg text-charcoal-500 hover:text-white transition-colors">
                              <Eye size={16} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-charcoal-500 font-serif italic text-xl">
                    No active orders matching these criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
