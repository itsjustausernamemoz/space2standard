import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  ExternalLink,
  History,
  TrendingUp,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@shared/utils';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  total_revenue: number;
  created_at: string;
}

export const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6;
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(0, searchTerm);
      setCurrentPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  async function fetchClients(page: number, search: string) {
    setLoading(true);
    const from = page * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order('full_name')
      .range(from, to);

    if (error) {
      if (error.code === '42P01') {
         await syncClientsFromOrders();
         return;
      }
      toast.error('Failed to fetch client portfolio');
      setLoading(false);
      return;
    }

    setClients(data || []);
    setTotalItems(count || 0);
    setLoading(false);
  }

  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.full_name || !newClient.email) {
      toast.error('Identity and Communication channels are required');
      return;
    }

    const { error } = await supabase.from('clients').insert([newClient]);
    
    if (error) {
      toast.error(error.message || 'Error registering artisan client');
    } else {
      toast.success('Artisan client registered in portfolio');
      setIsModalOpen(false);
      setNewClient({ full_name: '', email: '', phone: '', address: '' });
      fetchClients(currentPage, searchTerm);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchClients(newPage, searchTerm);
  };

  async function syncClientsFromOrders() {
    toast.loading('Initialising artisan client ledger...');
    const { data: orders } = await supabase.from('orders').select('*');
    
    if (orders && orders.length > 0) {
      // Deduplicate by email
      const uniqueClients = Array.from(new Map(orders.map((o: any) => [o.customer_email, o])).values());
      
      const clientPayloads = uniqueClients.map((o: any) => ({
        full_name: o.customer_name,
        email: o.customer_email,
        phone: o.customer_phone,
        address: o.delivery_address
      }));

      const { error } = await supabase.from('clients').insert(clientPayloads);
      if (error) {
        console.error('Sync error:', error);
      } else {
        fetchClients(0, '');
      }
    } else {
      setClients([]);
      setLoading(false);
    }
    toast.dismiss();
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Client Portfolio</h1>
          <p className="text-navy-500 text-sm italic font-light">Managing relationships and artisan specifications.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-dashboard-primary flex items-center gap-2"
        >
           <Plus size={18} />
           Register Client
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="dashboard-card bg-navy-900 border-[#ffffff0a] flex gap-5 items-center">
            <div className="p-4 bg-gold-500/10 text-gold-500 rounded-[6px]">
               <Users size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-navy-600 mb-1">Active Accounts</p>
               <h4 className="text-xl font-bold text-white">{totalItems}</h4>
            </div>
         </div>
         <div className="dashboard-card bg-navy-900 border-[#ffffff0a] flex gap-5 items-center">
            <div className="p-4 bg-gold-500/10 text-gold-500 rounded-[6px]">
               <TrendingUp size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-navy-600 mb-1">Top Tier Retention</p>
               <h4 className="text-xl font-bold text-white">High Value</h4>
            </div>
         </div>
         <div className="dashboard-card bg-navy-900 border-[#ffffff0a] flex gap-5 items-center col-span-1 md:col-span-1">
            <div className="p-4 bg-gold-500/10 text-gold-500 rounded-[6px]">
               <CreditCard size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-navy-600 mb-1">Portfolio Valuation</p>
               <h4 className="text-xl font-bold text-white">Calculated In Ledger</h4>
            </div>
         </div>
      </div>

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-black/80 backdrop-blur-sm">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="dashboard-card max-w-lg w-full space-y-8"
           >
              <div className="flex justify-between items-center">
                 <h2 className="text-xl font-serif text-white uppercase tracking-widest">Register Artisan Client</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-navy-500 hover:text-white transition-colors">
                    <Plus size={24} className="rotate-45" />
                 </button>
              </div>

              <form onSubmit={handleRegisterClient} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-600">Full Legal Name</label>
                    <input 
                      className="input-base" 
                      placeholder="e.g. Alexander Sterling" 
                      value={newClient.full_name}
                      onChange={e => setNewClient({...newClient, full_name: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-600">Email Specification</label>
                    <input 
                      type="email"
                      className="input-base" 
                      placeholder="alexander@standard.com" 
                      value={newClient.email}
                      onChange={e => setNewClient({...newClient, email: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-navy-600">Contact Number</label>
                       <input 
                         className="input-base" 
                         placeholder="+264 81..." 
                         value={newClient.phone}
                         onChange={e => setNewClient({...newClient, phone: e.target.value})}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-navy-600">Location</label>
                       <input 
                         className="input-base" 
                         placeholder="Windhoek, Namibia" 
                         value={newClient.address}
                         onChange={e => setNewClient({...newClient, address: e.target.value})}
                       />
                    </div>
                 </div>
                 <button type="submit" className="btn-dashboard-primary w-full py-4 tracking-[0.2em] font-bold">
                    Add to Portfolio
                 </button>
              </form>
           </motion.div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-600" />
           <input 
             type="text" 
             placeholder="Search by name, email or phone..." 
             className="input-base pl-12"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          [1,2,3,4].map(i => (
             <div key={i} className="h-48 bg-navy-900/40 animate-pulse rounded-[6px]" />
          ))
        ) : clients.length > 0 ? (
          clients.map((client) => (
            <div key={client.id} className="dashboard-card group hover:border-[#c9a46a40] transition-all p-8 relative overflow-hidden">
               {/* Background Accent */}
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <Users size={120} strokeWidth={1} />
               </div>

               <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                  <div className="space-y-6 flex-1">
                     <div className="space-y-1">
                        <h3 className="text-xl font-serif text-white">{client.full_name}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gold-500">Client since {formatDate(client.created_at)}</p>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center gap-4 text-xs text-navy-500 font-light tracking-wide">
                           <div className="p-1.5 bg-white/5 rounded-[4px]"><Mail size={14} /></div>
                           {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-4 text-xs text-navy-500 font-light tracking-wide">
                             <div className="p-1.5 bg-white/5 rounded-[4px]"><Phone size={14} /></div>
                             {client.phone}
                          </div>
                        )}
                        {client.address && (
                          <div className="flex items-start gap-4 text-xs text-navy-500 font-light tracking-wide italic">
                             <div className="p-1.5 bg-white/5 rounded-[4px] mt-0.5"><MapPin size={14} /></div>
                             <span className="leading-relaxed">{client.address}</span>
                          </div>
                        )}
                     </div>
                  </div>

                  <div className="md:w-48 space-y-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[#ffffff0a] md:pl-8 flex flex-col justify-between h-full">
                     <div className="space-y-1">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-navy-600">Lifetime Equity</p>
                        <p className="text-xl font-bold text-white tracking-tight">{formatCurrency(client.total_revenue || 0)}</p>
                     </div>
                     
                     <div className="flex flex-col gap-2 mt-auto">
                        <button className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-[4px] text-[10px] font-bold uppercase tracking-widest text-white transition-all">
                           <History size={14} /> Log History
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 bg-gold-500/5 hover:bg-gold-500/10 border border-gold-500/20 rounded-[4px] text-[10px] font-bold uppercase tracking-widest text-gold-500 transition-all">
                           <ExternalLink size={14} /> Records
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-40 flex flex-col items-center justify-center space-y-6">
             <Users size={64} className="text-navy-800" strokeWidth={0.5} />
             <div className="text-center space-y-2">
                <p className="font-serif italic text-2xl text-navy-600">The Portfolio is Currently Empty</p>
                <p className="text-navy-700 text-xs max-w-sm">When you register clients or process artisan orders, they will appear here as part of your premium relationship network.</p>
             </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalItems > itemsPerPage && (
        <div className="flex justify-between items-center bg-white/[0.02] border border-[#ffffff0a] px-8 py-4 rounded-[6px] text-[10px] font-bold uppercase tracking-widest text-navy-600">
           <span>Portfolio page {currentPage + 1} of {Math.ceil(totalItems / itemsPerPage)} ({totalItems} records)</span>
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
