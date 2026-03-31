import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart3, 
  AlertTriangle, 
  History as HistoryIcon, 
  RefreshCw,
  Plus,
  Minus,
  Save,
  X
} from 'lucide-react';
import type { Product, StockLog } from '@shared/types';
import { formatDate } from '@shared/utils';
import { toast } from 'react-hot-toast';

export const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState(3);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('Manual adjustment');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // 1. Fetch products
    const { data: pData } = await supabase
      .from('products')
      .select('*')
      .order('stock_quantity', { ascending: true });
    
    // 2. Fetch stock logs
    const { data: logData } = await supabase
      .from('stock_log')
      .select(`*, product:products(name)`)
      .order('recorded_at', { ascending: false })
      .limit(20);

    // 3. Fetch threshold from settings
    const { data: settings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'low_stock_threshold')
      .single();
    
    if (settings) setLowStockThreshold(parseInt(settings.value));
    
    setProducts(pData || []);
    setStockLogs(logData || []);
    setLoading(false);
  }

  const handleStockUpdate = async (id: string, currentStock: number) => {
    if (adjustment === 0) return;
    const newStock = Math.max(0, currentStock + adjustment);

    try {
      // 1. Update product stock
      const { error: pError } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', id);
      
      if (pError) throw pError;

      // 2. Record log
      const { error: logError } = await supabase
        .from('stock_log')
        .insert({
          product_id: id,
          change_amount: adjustment,
          reason,
          admin_note: `Manual update by admin`
        });
      
      if (logError) throw logError;

      toast.success('Stock level mastered.');
      setEditingId(null);
      setAdjustment(0);
      setReason('Manual adjustment');
      fetchData();
    } catch (error) {
      toast.error('Failed to update stock');
      console.error(error);
    }
  };

  const lowStockItems = products.filter((p: Product) => p.stock_quantity <= lowStockThreshold);

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Artisan Inventory</h1>
          <p className="text-charcoal-500 text-sm">Monitor hardwoods, finishes, and bespoke furniture stock.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={fetchData} className="p-3 bg-charcoal-800 text-charcoal-500 hover:text-white rounded-xl border border-charcoal-700 transition-colors">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="dashboard-card bg-charcoal-900 border-charcoal-800">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-success/10 text-success rounded-xl">
                  <BarChart3 size={20}/>
               </div>
               <span className="text-[10px] font-bold px-2 py-1 bg-success/5 text-success rounded-full uppercase tracking-widest">Optimal</span>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500">Total Stock</p>
               <h3 className="text-2xl font-bold text-white">{products.reduce((acc: number, p: Product) => acc + p.stock_quantity, 0)} Units</h3>
            </div>
         </div>

         <div className="dashboard-card bg-charcoal-900 border-charcoal-800">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-warning/10 text-warning rounded-xl">
                  <AlertTriangle size={20}/>
               </div>
               <span className="text-[10px] font-bold px-2 py-1 bg-warning/5 text-warning rounded-full uppercase tracking-widest">Attention</span>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500">Low Stock Alarms</p>
               <h3 className="text-2xl font-bold text-white">{lowStockItems.length} Pieces</h3>
            </div>
         </div>
         
         <div className="lg:col-span-2 dashboard-card bg-charcoal-800/20 border-gold-500/10 flex flex-col justify-center p-8">
            <p className="text-xs font-serif italic text-gold-500 mb-2">Artisan Tip:</p>
            <p className="text-sm font-light leading-relaxed text-cream-100/60 font-inter italic">
               Maintaining a lead stock of 3 units per collection ensures immediate 
               dispatch for your most loyal clients while bespoke orders are in progress.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Stock Management Table */}
        <div className="lg:col-span-8 dashboard-card p-0 overflow-hidden border-none shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-charcoal-950/50 text-[10px] uppercase font-bold tracking-[0.2em] text-charcoal-500 border-b border-charcoal-800">
                <th className="px-8 py-5">Product Archive</th>
                <th className="px-8 py-5">Current Unit Count</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {products.map((p: Product) => {
                const isLow = p.stock_quantity <= lowStockThreshold;
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id} className="group hover:bg-charcoal-800/30">
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white group-hover:text-gold-400 transition-colors">{p.name}</p>
                        <p className="text-[10px] text-charcoal-500 uppercase tracking-widest">REF: {p.id.slice(0,8)}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-lg font-bold ${isLow ? 'text-warning' : 'text-white'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                        isLow ? 'bg-warning/10 text-warning border-warning/20' : 'bg-success/10 text-success border-success/20'
                      }`}>
                        {isLow ? 'Refill Required' : 'Mastered'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {isEditing ? (
                        <div className="flex justify-end items-center gap-3 animate-in slide-in-from-right-4 duration-300">
                           <div className="flex items-center gap-1 bg-charcoal-950 px-3 py-1 rounded border border-charcoal-700">
                              <button onClick={() => setAdjustment((prev: number) => prev - 1)} className="text-charcoal-500 hover:text-white p-1"><Minus size={14}/></button>
                              <input 
                                type="number" 
                                className="w-12 bg-transparent text-center text-xs text-white focus:outline-none" 
                                value={adjustment} 
                                onChange={e => setAdjustment(parseInt(e.target.value) || 0)} 
                              />
                              <button onClick={() => setAdjustment((prev: number) => prev + 1)} className="text-charcoal-500 hover:text-white p-1"><Plus size={14}/></button>
                           </div>
                           <button onClick={() => handleStockUpdate(p.id, p.stock_quantity)} className="p-2 bg-gold-500 text-charcoal-950 rounded hover:bg-gold-400 transition-colors">
                              <Save size={14}/>
                           </button>
                           <button onClick={() => setEditingId(null)} className="p-2 text-charcoal-500 hover:text-white">
                              <X size={14}/>
                           </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setEditingId(p.id); setAdjustment(0); }}
                          className="px-4 py-2 border border-charcoal-700 text-xs text-charcoal-400 hover:text-white hover:border-charcoal-500 rounded-lg transition-all font-bold uppercase tracking-widest"
                        >
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Stock Log Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <div className="dashboard-card bg-charcoal-900 border-charcoal-800">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white flex items-center gap-2 mb-8">
                 <HistoryIcon size={16} className="text-gold-500" /> Stock Chronologue
              </h3>
              <div className="space-y-8">
                 {stockLogs.map((log: any) => (
                   <div key={log.id} className="relative pl-6 border-l border-charcoal-800 group">
                      <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-charcoal-800 group-hover:bg-gold-500 transition-colors" />
                      <div className="space-y-1">
                         <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-white uppercase tracking-widest truncate max-w-[120px]">
                               {(log as any).product?.name}
                            </p>
                            <span className={`text-[10px] font-bold flex items-center gap-1 ${log.change_amount > 0 ? 'text-success' : 'text-error'}`}>
                               {log.change_amount > 0 ? <Plus size={10}/> : <Minus size={10}/>}
                               {Math.abs(log.change_amount)}
                            </span>
                         </div>
                         <p className="text-[10px] text-charcoal-500 font-inter">{log.reason}</p>
                         <p className="text-[9px] uppercase tracking-widest font-bold text-charcoal-600 border-t border-charcoal-800/50 pt-1 mt-1">
                            {formatDate(log.recorded_at)}
                         </p>
                      </div>
                   </div>
                 ))}
                 {stockLogs.length === 0 && (
                   <p className="text-xs italic text-charcoal-600 text-center py-8">No stock logs recorded.</p>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
