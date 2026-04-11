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
  CreditCard
} from 'lucide-react';
import { formatCurrency, formatDate } from '@shared/utils';
import { toast } from 'react-hot-toast';

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

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    
    // 1. Fetch clients
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('full_name');

    if (clientsError) {
      if (clientsError.code === '42P01') {
         await syncClientsFromOrders();
         return;
      }
      toast.error('Failed to fetch clients');
      setLoading(false);
      return;
    }

    // 2. Fetch all invoices to calculate revenue
    const { data: docs } = await supabase
      .from('documents')
      .select('grand_total, orders!inner(customer_email)')
      .eq('type', 'invoice');

    const revenueMap: Record<string, number> = {};
    docs?.forEach(doc => {
      const email = doc.orders?.customer_email;
      if (email) {
        revenueMap[email] = (revenueMap[email] || 0) + (doc.grand_total || 0);
      }
    });

    const clientsWithRevenue = (clientsData || []).map(c => ({
      ...c,
      total_revenue: revenueMap[c.email] || 0
    }));

    setClients(clientsWithRevenue);
    setLoading(false);
  }

  async function syncClientsFromOrders() {
    toast.loading('Initialising artisan client ledger...');
    const { data: orders } = await supabase.from('orders').select('*');
    
    if (orders && orders.length > 0) {
      // Deduplicate by email
      const uniqueClients = Array.from(new Map(orders.map(o => [o.customer_email, o])).values());
      
      const clientPayloads = uniqueClients.map(o => ({
        full_name: o.customer_name,
        email: o.customer_email,
        phone: o.customer_phone,
        address: o.delivery_address
      }));

      const { error } = await supabase.from('clients').insert(clientPayloads);
      if (error) {
        console.error('Sync error:', error);
      } else {
        fetchClients();
      }
    } else {
      setClients([]);
      setLoading(false);
    }
    toast.dismiss();
  }

  const filteredClients = clients.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Client Portfolio</h1>
          <p className="text-navy-500 text-sm italic font-light">Managing relationships and artisan specifications.</p>
        </div>
        <button className="btn-dashboard-primary flex items-center gap-2">
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
               <h4 className="text-xl font-bold text-white">{clients.length}</h4>
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
               <h4 className="text-xl font-bold text-white">{formatCurrency(clients.reduce((s, c) => s + (c.total_revenue || 0), 0))}</h4>
            </div>
         </div>
      </div>

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
        ) : filteredClients.length > 0 ? (
          filteredClients.map((client) => (
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
    </div>
  );
};
