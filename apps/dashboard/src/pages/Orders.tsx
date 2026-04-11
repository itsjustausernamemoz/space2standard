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
  const [activeTab, setActiveTab] = useState<'new' | 'processed'>('new');

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
       if (!window.confirm("Fulfilling this order will permanently decrement artisan materials. Proceed?")) return;
       const { error } = await supabase.rpc('mark_order_completed', { target_order_id: id });
       if (error) {
         toast.error('Fulfillment synchronization failed');
         return;
       }
       setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
       toast.success("Artisan piece fulfilled. Inventory synced.");
       return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Status update failed');
    } else {
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      toast.success(`Inquiry status updated to ${status}`);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isNew = o.status === 'new';
    const matchesTab = activeTab === 'new' ? isNew : !isNew;
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Order Management</h1>
          <p className="text-navy-500 text-sm font-light italic">Orchestrating the lifecycle of handcrafted excellence.</p>
        </div>
        <div className="bg-gold-500/10 border border-gold-500/20 rounded-[4px] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500">
           {orders.filter(o => o.status === 'new').length} Inbound Inquiries
        </div>
      </header>

      {/* Segmented Control & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
         <div className="flex bg-white/5 p-1 rounded-[6px] w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('new')}
              className={cn(
                "flex-1 md:flex-none px-8 py-2.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'new' ? "bg-gold-500 text-navy-950 shadow-md" : "text-navy-500 hover:text-white"
              )}
            >
               Inbound Inquiries
            </button>
            <button 
              onClick={() => setActiveTab('processed')}
              className={cn(
                "flex-1 md:flex-none px-8 py-2.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'processed' ? "bg-gold-500 text-navy-950 shadow-md" : "text-navy-500 hover:text-white"
              )}
            >
               Artisan Pipeline
            </button>
         </div>

         <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-600" />
            <input 
              type="text" 
              placeholder="Filter by customer, email or ID..." 
              className="input-base pl-12 py-2.5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-6">
         {loading ? (
            [1,2,3].map(i => <div key={i} className="h-32 bg-navy-900/40 animate-pulse rounded-[6px]" />)
         ) : filteredOrders.length > 0 ? (
            filteredOrders.map((o) => {
               const total = o.items?.reduce((sum, item) => sum + (item.unit_price_snapshot * item.quantity), 0) || 0;
               return (
                  <div key={o.id} className="dashboard-card group hover:border-white/10 transition-all">
                     <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                        <div className="flex-1 space-y-4">
                           <div className="flex items-center gap-4">
                              <h3 className="text-xl font-serif text-white">{o.customer_name}</h3>
                              <span className={cn(
                                 "px-3 py-1 rounded-[4px] text-[9px] font-bold uppercase tracking-widest border",
                                 getOrderStatusColor(o.status).replace('rounded-full', 'rounded-[4px]')
                              )}>
                                 {getOrderStatusLabel(o.status)}
                              </span>
                           </div>
                           <div className="flex flex-wrap gap-6 text-[10px] uppercase font-bold text-navy-500 tracking-[0.15em]">
                              <span className="flex items-center gap-2"><Mail size={12} className="text-gold-500/60" /> {o.customer_email}</span>
                              {o.customer_phone && <span className="flex items-center gap-2"><Phone size={12} className="text-gold-500/60" /> {o.customer_phone}</span>}
                              <span className="flex items-center gap-2 text-navy-600"><Clock size={12} /> {formatDate(o.created_at)}</span>
                           </div>
                        </div>

                        <div className="lg:w-48 space-y-1">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-navy-600">Investment Value</p>
                           <p className="text-xl font-bold text-white tracking-tight">{formatCurrency(total)}</p>
                           <p className="text-[9px] text-navy-600 uppercase font-bold tracking-widest">{o.items?.length || 0} Piece(s) Specified</p>
                        </div>

                        <div className="flex gap-3 w-full lg:w-auto">
                           {o.status === 'new' ? (
                              <button 
                                onClick={() => navigate(`/invoices/new?orderId=${o.id}&type=quotation`)}
                                className="btn-dashboard-primary flex-1 lg:flex-none flex items-center justify-center gap-3"
                              >
                                 <FileText size={16} /> Issue Quotation
                              </button>
                           ) : (
                              <select 
                                className="input-base py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest text-white/60 w-full lg:w-44"
                                value={o.status}
                                disabled={o.status === 'completed'}
                                onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                              >
                                 <option value="contacted">Contacted</option>
                                 <option value="in_progress">Artisan Build</option>
                                 <option value="completed">Delivered</option>
                                 <option value="cancelled">Cancelled</option>
                              </select>
                           )}
                           
                           <button 
                             onClick={() => navigate(`/invoices/new?orderId=${o.id}&type=invoice`)}
                             disabled={o.status === 'new'}
                             className="p-3 bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed rounded-[4px] text-white hover:text-gold-500 hover:bg-white/10 transition-all shadow-sm"
                             title="Issue Final Invoice"
                           >
                              <ShieldCheck size={18} />
                           </button>
                           
                           <button className="p-3 bg-white/5 rounded-[4px] text-white/40 hover:text-white transition-colors">
                              <Eye size={18} />
                           </button>
                        </div>
                     </div>
                  </div>
               )
            })
         ) : (
            <div className="py-40 flex flex-col items-center justify-center space-y-6">
               <History size={64} className="text-navy-900" strokeWidth={0.5} />
               <div className="text-center space-y-2">
                  <p className="font-serif italic text-2xl text-navy-600">No Orders in this Repository</p>
                  <p className="text-navy-700 text-xs max-w-sm">When artisan inquiries arrive from the storefront, they will be categorised here for meticulous relationship management.</p>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};
