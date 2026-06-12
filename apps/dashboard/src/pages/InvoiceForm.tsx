import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Trash2, 
  FileText,
  Calculator,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@shared/utils';
import { SelectField } from '@/components/SelectField';

export const InvoiceForm = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const orderId = searchParams.get('orderId');
  const fromQuoteId = searchParams.get('fromQuote');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    type: (searchParams.get('type') as 'invoice' | 'quotation') || 'invoice',
    order_id: orderId || '',
    vat_rate: 15,
    discount_total: 0,
    client_id: '',
    payment_terms: ''
  });

  const [lineItems, setLineItems] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      setFetching(true);
      
      // 1. Fetch Global Settings (VAT)
      const { data: settings } = await supabase.from('settings').select('*');
      const vat = settings?.find(s => s.key === 'vat_rate')?.value;
      if (vat) {
        setFormData(prev => ({ ...prev, vat_rate: parseFloat(vat) }));
      }

      // 2. Fetch Clients for selection
      const { data: clientList } = await supabase.from('clients').select('id, full_name, email');
      setClients(clientList || []);

      const terms = settings?.find(s => s.key === 'ledger_default_terms')?.value;
      if (terms) {
        setFormData(prev => ({ ...prev, payment_terms: terms }));
      }

      if (isEdit && id) {
        await fetchInvoice(id);
      } else if (orderId && orderId !== 'null') {
        await fetchOrderDetails(orderId);
      } else if (fromQuoteId) {
        await fetchQuoteDetails(fromQuoteId);
      } else {
        addLineItem();
      }
      setFetching(false);
    };
    
    init();
  }, [isEdit, id, orderId]);

  async function fetchInvoice(invoiceId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (error) {
      toast.error('Failed to load document');
      navigate('/invoices');
    } else {
      setFormData({
        type: data.type,
        order_id: data.order_id || '',
        vat_rate: data.vat_rate,
        discount_total: data.discount_total || 0,
        client_id: data.client_id || '',
        payment_terms: data.payment_terms || ''
      });
      setLineItems(data.line_items || []);
      setSelectedClientId(data.client_id || '');
    }
  }

  async function fetchOrderDetails(oid: string) {
    const { data: orderData, error } = await supabase
      .from('orders')
      .select(`*, items:order_items(*)`)
      .eq('id', oid)
      .single();

    if (error) {
      toast.error('Failed to load order details');
    } else if (orderData) {
      // 1. Map order items correctly
      const items = (orderData.items || []).map((item: any) => ({
        product_id: item.product_id,
        product_name: item.product_name_snapshot,
        quantity: item.quantity,
        unit_price: item.unit_price_snapshot,
        unit: 'Piece',
        total: item.quantity * item.unit_price_snapshot
      }));
      setLineItems(items);
      setFormData(prev => ({ ...prev, order_id: oid }));
      
      // 2. Identify and link the artisan client automatically
      // Use email matching because the client must exist in the ledger (via DB trigger)
      const { data: clientRecord } = await supabase
        .from('clients')
        .select('id, full_name')
        .eq('email', orderData.customer_email)
        .single();

      if (clientRecord) {
        setSelectedClientId(clientRecord.id);
        setFormData(prev => ({ ...prev, client_id: clientRecord.id }));
        toast.success(`Automatically linked to: ${clientRecord.full_name}`);
      } else {
        toast.error('Corresponding artisan client not found in portfolio');
      }
      
      toast.success('Inquiry pieces imported successfully');
    }
  }

  async function fetchQuoteDetails(quoteId: string) {
    const { data: quoteData, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (error) {
      toast.error('Failed to load source quotation');
    } else if (quoteData) {
      setLineItems(quoteData.line_items || []);
      setFormData(prev => ({ 
        ...prev, 
        client_id: quoteData.client_id || '',
        discount_total: quoteData.discount_total || 0,
        vat_rate: quoteData.vat_rate || 15,
        order_id: quoteData.order_id || ''
      }));
      setSelectedClientId(quoteData.client_id || '');
      toast.success('Specifications imported from quotation');
    }
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { product_name: '', quantity: 1, unit: 'Piece', unit_price: 0, total: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].unit_price || 0);
    }
    
    setLineItems(newItems);
  };

  // Calculations
  const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  const vatAmount = (subtotal - formData.discount_total) * (formData.vat_rate / 100);
  const grandTotal = subtotal - formData.discount_total + vatAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      toast.error('Add at least one piece to the specification');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      client_id: selectedClientId || null,
      line_items: lineItems,
      subtotal,
      vat_amount: vatAmount,
      grand_total: grandTotal,
      order_id: formData.order_id || null,
      payment_terms: formData.payment_terms
    };

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('documents')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('documents')
          .insert(payload);
        if (error) throw error;
        
        // --- ORDER PIPELINE STATUS LOGIC ---
        if (formData.order_id) {
          let newStatus = '';
          if (formData.type === 'quotation') {
             newStatus = 'pending';
          } else if (formData.type === 'invoice') {
             newStatus = 'completed';
          }
          
          if (newStatus) {
            await supabase.from('orders').update({ status: newStatus }).eq('id', formData.order_id);
          }
        }
      }

      toast.success(isEdit ? 'Ledger record updated' : 'Professional document issued');
      navigate('/invoices');
    } catch (error: any) {
      toast.error(error.message || 'Error processing document');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
     return (
       <div className="flex items-center justify-center h-96">
         <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
       </div>
     );
  }

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <Link to="/invoices" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-navy-500 hover:text-gold-500 transition-colors mb-4">
            <ChevronLeft size={14} /> Back to Records
          </Link>
          <h1 className="text-3xl font-serif text-white tracking-tight">
            {isEdit ? 'Edit Document' : (formData.type === 'invoice' ? 'Issue Invoice' : 'Create Quotation')}
          </h1>
          <p className="text-navy-400 text-sm font-light italic">Refining financial artisan records for dispatch.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <button onClick={() => navigate('/invoices')} className="btn-dashboard-ghost flex-1 md:flex-none">
             Cancel
           </button>
           <button onClick={handleSubmit} disabled={loading} className="btn-dashboard-primary flex items-center justify-center gap-2 flex-1 md:flex-none">
             <Save size={18} />
             {loading ? 'Processing...' : (isEdit ? 'Update Record' : 'Finalise Document')}
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-8">
           <div className="dashboard-card space-y-10">
              <div className="flex justify-between items-center border-b border-[#ffffff0a] pb-6">
                 <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white">Project Specification</h3>
                 <button onClick={addLineItem} className="text-[10px] font-bold uppercase tracking-widest text-gold-500 hover:text-white flex items-center gap-2 transition-colors">
                    <Plus size={14} /> Add Piece
                 </button>
              </div>

              <div className="space-y-4">
                 {lineItems.map((item: any, idx: number) => (
                   <div key={idx} className="grid grid-cols-12 gap-4 items-end bg-white/[0.02] p-6 rounded-[6px] border border-[#ffffff0a] group hover:border-[#c9a46a20] transition-all">
                      <div className="col-span-12 md:col-span-5 space-y-2">
                         <label className="text-[9px] font-bold uppercase tracking-widest text-navy-600 ml-1">Piece Description</label>
                         <input 
                           className="input-base" 
                           value={item.product_name} 
                           onChange={e => updateLineItem(idx, 'product_name', e.target.value)} 
                           placeholder="e.g. Handcrafted Oak Mirror Frame..."
                         />
                      </div>
                      <div className="col-span-4 md:col-span-2 space-y-2">
                         <label className="text-[9px] font-bold uppercase tracking-widest text-navy-600 ml-1">Qty</label>
                         <input 
                           type="number" 
                           className="input-base text-center pr-3" 
                           value={item.quantity} 
                           onChange={e => updateLineItem(idx, 'quantity', parseInt(e.target.value))} 
                         />
                      </div>
                      <div className="col-span-8 md:col-span-2 space-y-2">
                         <label className="text-[9px] font-bold uppercase tracking-widest text-navy-600 ml-1">Unit Rate</label>
                         <input 
                           type="number" 
                           className="input-base" 
                           value={item.unit_price} 
                           placeholder="N$"
                           onChange={e => updateLineItem(idx, 'unit_price', parseFloat(e.target.value))} 
                         />
                      </div>
                      <div className="col-span-10 md:col-span-2 space-y-2">
                         <label className="text-[9px] font-bold uppercase tracking-widest text-navy-600 ml-1">Total (N$)</label>
                         <div className="h-[46px] flex items-center px-4 bg-navy-black/40 rounded-[4px] text-xs font-bold text-white border border-[#ffffff0a] shadow-inner">
                            {formatCurrency(item.total || 0)}
                         </div>
                      </div>
                      <div className="col-span-2 md:col-span-1 flex justify-center pb-1">
                         <button onClick={() => removeLineItem(idx)} className="p-3 text-navy-700 hover:text-[#ef4444] hover:bg-[#ef4444]/5 rounded-[4px] transition-all">
                            <Trash2 size={16} />
                         </button>
                      </div>
                   </div>
                 ))}
                 
                 {lineItems.length === 0 && (
                   <div className="h-48 border border-dashed border-[#ffffff1a] rounded-[6px] flex flex-col items-center justify-center gap-4 text-navy-700 italic">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <Plus size={24} className="opacity-40" />
                      </div>
                      <p className="text-[10px] uppercase font-bold tracking-widest">No pieces specified for this record</p>
                   </div>
                 )}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="dashboard-card space-y-10">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white flex items-center gap-3">
                 <Calculator size={16} className="text-gold-500" /> Artisan Summary
              </h3>
              
              <div className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-navy-600 ml-1">Artisan Client</label>
                    <SelectField
                      className="input-base py-3"
                      value={selectedClientId}
                      onChange={setSelectedClientId}
                      placeholder="Select a Client..."
                      options={[
                        { value: '', label: 'Select a Client...' },
                        ...clients.map(c => ({ value: c.id, label: `${c.full_name} (${c.email})` }))
                      ]}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-navy-600 ml-1">Document Format</label>
                    <SelectField
                      className="input-base py-3"
                      value={formData.type}
                      onChange={v => setFormData({...formData, type: v as any})}
                      options={[
                        { value: 'invoice',   label: 'Commercial Tax Invoice' },
                        { value: 'quotation', label: 'Project Quotation' },
                      ]}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-navy-600 ml-1">Inquiry Reference</label>
                    <div className="input-base bg-white/5 text-navy-600 flex items-center gap-3 border-dashed">
                       <ShieldCheck size={14} className="opacity-40" />
                       <span className="text-[11px] font-mono tracking-tighter">{formData.order_id || 'STANDALONE TRANSACTION'}</span>
                    </div>
                 </div>

                 <div className="gold-divider !my-10" />

                 <div className="space-y-5">
                    <div className="flex justify-between text-[11px]">
                       <span className="text-navy-700 uppercase tracking-widest font-bold">Base Valuation</span>
                       <span className="text-white font-bold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                       <span className="text-navy-700 uppercase tracking-widest font-bold">Special Adjustment</span>
                       <div className="relative">
                          <input 
                            type="number" 
                            className="w-32 text-right bg-white/5 border border-[#ffffff1a] rounded-[4px] px-3 py-1.5 text-[11px] font-bold text-[#ef4444] focus:outline-none focus:border-[#ef444450] transition-all" 
                            value={formData.discount_total} 
                            onChange={e => setFormData({...formData, discount_total: parseFloat(e.target.value) || 0})}
                          />
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-navy-800">N$</span>
                       </div>
                    </div>
                    <div className="flex justify-between text-[11px]">
                       <span className="text-navy-700 uppercase tracking-widest font-bold">Namibian VAT ({formData.vat_rate}%)</span>
                       <span className="text-white/60 font-medium">{formatCurrency(vatAmount)}</span>
                    </div>
                    
                    <div className="pt-10 mt-6 border-t border-[#ffffff0a]">
                       <div className="flex justify-between items-end">
                          <div className="space-y-1">
                             <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-500">Grand Total</span>
                             <p className="text-[8px] text-navy-800 uppercase font-bold tracking-[0.2em]">{formData.type === 'invoice' ? 'Payable Amount' : 'Projected Cost'}</p>
                          </div>
                          <span className="text-3xl font-serif text-white tracking-widest">{formatCurrency(grandTotal)}</span>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="p-6 bg-[#c9a46a08] rounded-[6px] border border-[#c9a46a1a] flex gap-4">
                 <FileText className="text-gold-500 shrink-0 opacity-60" size={20} strokeWidth={1.5} />
                 <p className="text-[10px] font-light text-navy-600 leading-relaxed italic">
                    Finalising this record will permanently archive the specifications in the Artisan Ledger for high-fidelity PDF generation.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
