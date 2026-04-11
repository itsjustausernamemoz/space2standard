import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useStorefrontAuth } from '../contexts/StorefrontAuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { CheckCircle2, Package, Truck, PhoneCall, ShoppingBag } from 'lucide-react';
import { calcDiscount, formatCurrency } from '@shared/utils';
import { ScrollReveal } from '../components/ScrollReveal';

export const OrderForm = () => {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const { user, profile } = useStorefrontAuth();
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [vatRate, setVatRate] = useState(15);
  
  const [formData, setFormData] = useState({
    customer_name: profile?.full_name || '',
    customer_email: user?.email || '',
    customer_phone: profile?.phone || '',
    delivery_address: profile?.delivery_address || '',
    special_notes: ''
  });

  useEffect(() => {
    if (user || profile) {
      setFormData(prev => ({
        ...prev,
        customer_name: prev.customer_name || profile?.full_name || '',
        customer_email: prev.customer_email || user?.email || '',
        customer_phone: prev.customer_phone || profile?.phone || '',
        delivery_address: prev.delivery_address || profile?.delivery_address || '',
      }));
    }
  }, [user, profile]);

  useEffect(() => {
    async function fetchData() {
      const { data: sData } = await supabase.from('settings').select('*');
      const vRate = sData?.find(s => s.key === 'vat_rate')?.value;
      if (vRate) setVatRate(parseFloat(vRate));
    }
    fetchData();
  }, []);

  const totalInclVat = cartTotal * (1 + vatRate / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      const { error: rpcError } = await supabase.rpc('place_order', {
        order_data: {
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          delivery_address: formData.delivery_address,
          special_notes: formData.special_notes,
          status: 'new'
        },
        items_data: items.map(item => {
          const actualPrice = calcDiscount(item.product.price, item.product.discount_type, item.product.discount_value);
          const discountAmt = item.product.price - actualPrice;
          
          return {
            product_id: item.product.id,
            product_name_snapshot: item.product.name,
            unit_price_snapshot: item.product.price,
            quantity: item.quantity,
            discount_applied: discountAmt > 0 ? discountAmt : 0
          };
        })
      });

      if (rpcError) throw rpcError;

      clearCart();
      setSubmitted(true);
      toast.success('Our master artisan has received your order request.');
    } catch (error: any) {
      console.error('Order Submission Error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-[160px] pb-40 px-6 container mx-auto text-center bg-[#060b18] min-h-screen">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto space-y-12">
            <div className="w-20 h-20 bg-[#c9a46a]/10 rounded-full flex items-center justify-center mx-auto border border-[#c9a46a]/20">
              <CheckCircle2 className="text-[#c9a46a]" size={40} strokeWidth={1} />
            </div>
            <div className="space-y-8">
              <h1 className="text-[56px] font-serif text-white tracking-tight">Order Received</h1>
              <p className="text-[17px] text-[#a0a8b8] leading-[1.8] font-light italic">
                Our workshop in Windhoek will contact you within 24 hours to discuss materiality and bespoke specifications.
              </p>
            </div>
            <div className="pt-12">
              <button 
                onClick={() => navigate('/products')} 
                className="px-12 py-4 border border-[#c9a46a] text-[#c9a46a] rounded-[4px] text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-[#c9a46a] hover:text-[#060b18]"
              >
                Return to Collection
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-[160px] pb-40 px-6 container mx-auto text-center bg-[#060b18] min-h-screen">
        <ScrollReveal>
          <div className="flex flex-col items-center gap-8">
             <ShoppingBag size={64} className="text-white/10" strokeWidth={1} />
             <p className="font-serif text-[32px] text-white">Your cart is empty.</p>
             <button 
                onClick={() => navigate('/products')} 
                className="px-10 py-4 bg-[#c9a46a] text-[#060b18] rounded-[4px] text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-white"
             >
                Browse Collection
             </button>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="pt-[56px] min-h-screen bg-[#060b18]">
      <div className="container mx-auto px-6 max-w-7xl">
        <header className="py-[120px] text-center max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="space-y-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Artisan Checkout</span>
              <h1 className="text-[48px] md:text-[64px] font-serif text-white tracking-tight leading-tight">Complete Order</h1>
              <p className="text-[17px] font-light text-[#a0a8b8] leading-[1.8] italic">
                Each piece is handcrafted in Namibia. No payment is required now — 
                we will contact you to finalise the bespoke specifications.
              </p>
            </div>
          </ScrollReveal>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start pb-40">
          <div className="lg:col-span-7">
            <ScrollReveal delay={0.1}>
              <div className="bg-[#060b18] border border-white/10 p-12 rounded-[6px] space-y-16">
                <div className="space-y-10">
                  <div className="space-y-8">
                    <h3 className="text-white font-serif text-[24px]">Dispatch Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-[14px]">
                      <div className="space-y-2">
                        <p className="text-[#c9a46a] uppercase tracking-widest font-bold text-[10px]">Client</p>
                        <p className="text-white font-serif text-[18px]">{formData.customer_name || 'Unspecified'}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-[#c9a46a] uppercase tracking-widest font-bold text-[10px]">Contact</p>
                        <p className="text-white font-light text-[15px]">{formData.customer_email}<br/>{formData.customer_phone}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-8 border-t border-white/5">
                      <p className="text-[#c9a46a] uppercase tracking-widest font-bold text-[10px]">Destination</p>
                      <p className="text-white font-light text-[15px] leading-relaxed italic">{formData.delivery_address || <span className="text-red-500">Please provide a delivery address</span>}</p>
                    </div>
                  </div>

                  {!user && (
                    <div className="pt-10 border-t border-white/5 space-y-10">
                      <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Full Name</label>
                          <input 
                            required 
                            className="input-apple"
                            placeholder="Johannes Müller"
                            value={formData.customer_name}
                            onChange={e => setFormData({...formData, customer_name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Email Address</label>
                          <input 
                            type="email" 
                            required 
                            className="input-apple"
                            placeholder="johannes@example.com"
                            value={formData.customer_email}
                            onChange={e => setFormData({...formData, customer_email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Phone Number</label>
                          <input 
                            type="tel"
                            required 
                            className="input-apple"
                            placeholder="+264 81 123 4567"
                            value={formData.customer_phone}
                            onChange={e => setFormData({...formData, customer_phone: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Delivery Address / City</label>
                          <input 
                            required 
                            className="input-apple"
                            placeholder="E.g. Klein Windhoek, Windhoek"
                            value={formData.delivery_address}
                            onChange={e => setFormData({...formData, delivery_address: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-8">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Special Notes (Optional)</label>
                    <textarea 
                      rows={4}
                      className="input-apple resize-none"
                      placeholder="Custom sizing, wood type, or finish requirements..."
                      value={formData.special_notes}
                      onChange={e => setFormData({...formData, special_notes: e.target.value})}
                    />
                  </div>

                  <button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="btn-apple-cta w-full py-5 shadow-lg"
                  >
                    {loading ? 'Processing...' : 'Dispatch Final Inquiry'}
                  </button>
                  
                  <p className="text-[10px] text-center uppercase tracking-[0.2em] text-[#a0a8b8] opacity-50 font-bold">
                    Secure Processing &bull; Bespoke Digital Contract
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-5 space-y-16">
            <ScrollReveal delay={0.2}>
              <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[6px] space-y-12">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#c9a46a]">Cart Summary</h3>
                
                <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-6 items-center">
                      <div className="w-16 h-20 bg-[#0d1220] border border-white/5 rounded-[4px] overflow-hidden">
                        <img 
                          src={item.product.images?.[0]?.storage_url || '/images/placeholder.jpg'} 
                          className="w-full h-full object-cover opacity-80" 
                          alt=""
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-[14px] font-bold text-white leading-tight">{item.product.name}</p>
                        <p className="text-[10px] uppercase text-[#a0a8b8] tracking-[0.2em]">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-[14px] font-serif text-white">
                         {formatCurrency(calcDiscount(item.product.price, item.product.discount_type, item.product.discount_value) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-white/5 space-y-4">
                  <div className="flex justify-between text-[12px] text-[#a0a8b8]">
                     <span className="uppercase font-bold tracking-[0.2em]">Subtotal</span>
                     <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  {vatRate > 0 && (
                     <div className="flex justify-between text-[12px] text-[#a0a8b8]">
                        <span className="uppercase font-bold tracking-[0.2em]">VAT ({vatRate}%)</span>
                        <span>{formatCurrency(cartTotal * (vatRate/100))}</span>
                     </div>
                  )}
                  <div className="flex justify-between text-[20px] font-serif pt-6 border-t border-white/10">
                     <span className="text-[#c9a46a]">Total Estimate</span>
                     <span className="text-white tracking-tight">
                        {formatCurrency(totalInclVat)}
                     </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="space-y-12">
                 <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#c9a46a]">Assurance</h3>
                 {[
                   { icon: <Package size={16} />, title: "Artisan Packing", desc: "Expertly protected for nationwide shipping within Namibia." },
                   { icon: <PhoneCall size={16} />, title: "Consultation", desc: "We contact you to verify dimensions and finishing details." },
                   { icon: <Truck size={16} />, title: "Personal Delivery", desc: "Professional business-to-home installation included." },
                 ].map((item, idx) => (
                   <div key={idx} className="flex gap-8 group">
                     <div className="w-12 h-12 border border-white/5 rounded-full flex items-center justify-center shrink-0 text-[#c9a46a] transition-all group-hover:border-[#c9a46a]/30">
                       {item.icon}
                     </div>
                     <div className="space-y-1">
                       <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white">{item.title}</h4>
                       <p className="text-[13px] font-light text-[#a0a8b8] leading-relaxed italic">{item.desc}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
};

