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
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Eye, 
  Mail, 
  Phone, 
  Clock,
  FileText,
  ShieldCheck,
  History,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'new' | 'pending' | 'completed'>('new');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 8;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(0, searchTerm, activeTab);
      setCurrentPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, activeTab]);

  const fetchOrders = async (page: number, search: string, tab: string) => {
    setLoading(true);
    const from = page * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
      .from('orders')
      .select(`*, items:order_items(*)`, { count: 'exact' });

    // Filter by Tab (New vs Pending vs Completed)
    query = query.eq('status', tab);

    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,order_number.ilike.%${search}%,id.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      toast.error('Failed to fetch artisanal inquiries');
    } else {
      setOrders(data || []);
      setTotalItems(count || 0);
    }
    setLoading(false);
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update artisan status');
    } else {
      toast.success('Status reconciled in registry');
      fetchOrders(currentPage, searchTerm, activeTab);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchOrders(newPage, searchTerm, activeTab);
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Artisan Pipeline</h1>
          <p className="text-navy-500 text-sm font-light italic">Orchestrating the lifecycle of handcrafted excellence.</p>
        </div>
        <div className="bg-gold-500/10 border border-gold-500/20 rounded-[4px] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500">
           {totalItems} Handcrafted Pieces in {activeTab}
        </div>
      </header>

      {/* Pipeline Navigation & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
         <div className="flex bg-white/5 p-1 rounded-[6px] w-full md:w-auto overflow-x-auto">
            <button 
              onClick={() => setActiveTab('new')}
              className={cn(
                "flex-1 md:flex-none px-6 py-2.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === 'new' ? "bg-gold-500 text-navy-950 shadow-md" : "text-navy-500 hover:text-white"
              )}
            >
               New Orders
            </button>
            <button 
              onClick={() => setActiveTab('pending')}
              className={cn(
                "flex-1 md:flex-none px-6 py-2.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === 'pending' ? "bg-gold-500 text-navy-950 shadow-md" : "text-navy-500 hover:text-white"
              )}
            >
               Pending Orders
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={cn(
                "flex-1 md:flex-none px-6 py-2.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === 'completed' ? "bg-gold-500 text-navy-950 shadow-md" : "text-navy-500 hover:text-white"
              )}
            >
               Completed Orders
            </button>
         </div>

         <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-600" />
            <input 
              type="text" 
              placeholder="Filter by customer, ID or order #..." 
              className="input-base pl-12 py-2.5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-6">
         {loading ? (
            [1,2,3].map((i: number) => <div key={i} className="h-32 bg-navy-900/40 animate-pulse rounded-[6px]" />)
         ) : orders.length > 0 ? (
            orders.map((o: Order) => {
               const total = o.items?.reduce((sum: number, item: any) => sum + (item.unit_price_snapshot * item.quantity), 0) || 0;
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
                              {o.order_number && (
                                <span className="text-[10px] font-mono text-gold-500/60 bg-gold-500/5 px-2 py-1 rounded-[4px] border border-gold-500/10">
                                   {o.order_number}
                                </span>
                              )}
                           </div>
                           <div className="flex flex-wrap gap-6 text-[10px] uppercase font-bold text-navy-500 tracking-[0.15em]">
                              <span className="flex items-center gap-2"><Mail size={12} className="text-gold-500/60" /> {o.customer_email}</span>
                              {o.customer_phone && <span className="flex items-center gap-2"><Phone size={12} className="text-gold-500/60" /> {o.customer_phone}</span>}
                              <span className="flex items-center gap-2 text-navy-600"><Clock size={12} /> {formatDate(o.created_at)}</span>
                           </div>
                        </div>

                        <div className="lg:w-48 space-y-1">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-navy-600">{activeTab === 'completed' ? 'Final Realised Value' : 'Investment Value'}</p>
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
                           ) : o.status === 'pending' ? (
                              <button 
                                onClick={() => navigate(`/invoices/new?orderId=${o.id}&type=invoice`)}
                                className="btn-dashboard-primary flex-1 lg:flex-none flex items-center justify-center gap-3 bg-success border-success hover:bg-success/80"
                              >
                                 <ShieldCheck size={16} /> Finalise Invoice
                              </button>
                           ) : (
                              <div className="flex items-center gap-3 px-6 py-2.5 bg-white/5 rounded-[4px] text-[9px] font-bold uppercase tracking-widest text-success border border-success/20">
                                 <ShieldCheck size={14} /> Reconciled
                              </div>
                           )}
                           
                           <button 
                             onClick={() => navigate(`/invoices?orderId=${o.id}`)}
                             className="p-3 bg-white/5 rounded-[4px] text-white hover:text-gold-500 hover:bg-white/10 transition-all shadow-sm"
                             title="View Documents"
                           >
                              <FileText size={18} />
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

      {/* Pagination */}
      {totalItems > itemsPerPage && (
        <div className="flex justify-between items-center bg-white/[0.02] border border-[#ffffff0a] px-8 py-4 rounded-[6px] text-[10px] font-bold uppercase tracking-widest text-navy-600">
           <span>Displaying page {currentPage + 1} of {Math.ceil(totalItems / itemsPerPage)} ({totalItems} total)</span>
           <div className="flex gap-6">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0 || loading}
                className="flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-colors"
              >
                <ChevronLeft size={14}/> Previous
              </button>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={(currentPage + 1) * itemsPerPage >= totalItems || loading}
                className="flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-colors"
              >
                Next <ChevronRight size={14}/>
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
