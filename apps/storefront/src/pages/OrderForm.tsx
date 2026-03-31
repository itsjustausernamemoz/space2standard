import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Product } from '@shared/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { CheckCircle2, ChevronRight, Package, Truck, PhoneCall } from 'lucide-react';

export const OrderForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('product');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [vatRate, setVatRate] = useState(15);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    special_notes: '',
    quantity: 1
  });

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-NA', { style: 'currency', currency: 'NAD' }).format(val);

  useEffect(() => {
    async function fetchData() {
      if (productId) {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
        if (data) setProduct(data);
      }

      const { data: sData } = await supabase.from('settings').select('*');
      const vRate = sData?.find(s => s.key === 'vat_rate')?.value;
      if (vRate) setVatRate(parseFloat(vRate));
    }
    fetchData();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        items_data: [
          {
            product_id: product?.id || null,
            product_name_snapshot: product?.name || 'Custom Consultation',
            unit_price_snapshot: product?.price || 0,
            quantity: formData.quantity,
            discount_applied: 0
          }
        ]
      });

      if (rpcError) throw rpcError;

      setSubmitted(true);
      toast.success('Our master artisan has received your commission request.');
    } catch (error: any) {
      console.error('Order Submission Error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-60 pb-40 px-6 container mx-auto text-center bg-navy-950 min-h-screen">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl mx-auto space-y-12"
        >
          <div className="w-24 h-24 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto shadow-inner border border-gold-500/20">
            <CheckCircle2 className="text-gold-500" size={48} strokeWidth={1} />
          </div>
          <div className="space-y-6">
            <h1 className="text-5xl font-serif text-white tracking-tight">Commission Received</h1>
            <p className="text-lg font-light text-navy-400 leading-relaxed max-w-xl mx-auto italic">
              Thank you, {formData.customer_name}. We have logged your request for 
              <span className="text-gold-500 font-medium"> {product?.name || 'a custom piece'}</span>. 
              Our studio in Windhoek will contact you within 24 hours to discuss the materiality and dimensions.
            </p>
          </div>
          <div className="gold-divider" />
          <Button onClick={() => navigate('/products')} variant="outline" className="px-12 py-4 rounded-xl border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-all">
            Return to Collection
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 min-h-screen bg-navy-950">
      <div className="container mx-auto px-6 max-w-6xl">
        <header className="mb-24 space-y-6 text-center max-w-3xl mx-auto">
          <span className="section-label">Artisan Inquiry</span>
          <h1 className="text-6xl font-serif text-white tracking-tight leading-none">Begin Your Commission</h1>
          <p className="text-lg font-light text-navy-400 leading-relaxed italic">
            Each piece is handcrafted in Windhoek. No payment is required now — 
            we will contact you to finalise the bespoke specifications.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          <div className="lg:col-span-7">
            <Card variant="solid" className="bg-navy-900 border-navy-800 p-12 rounded-2xl shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <Input 
                    label="Full Name" 
                    required 
                    placeholder="e.g. Johannes Müller"
                    className="bg-navy-950 border-navy-800 text-white"
                    value={formData.customer_name}
                    onChange={e => setFormData({...formData, customer_name: e.target.value})}
                  />
                  <Input 
                    label="Email Address" 
                    type="email" 
                    required 
                    placeholder="johannes@example.com"
                    className="bg-navy-950 border-navy-800 text-white"
                    value={formData.customer_email}
                    onChange={e => setFormData({...formData, customer_email: e.target.value})}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-10">
                  <Input 
                    label="Phone Number" 
                    required 
                    placeholder="+264..."
                    className="bg-navy-950 border-navy-800 text-white"
                    value={formData.customer_phone}
                    onChange={e => setFormData({...formData, customer_phone: e.target.value})}
                  />
                  <Input 
                    label="Quantity" 
                    type="number" 
                    min="1" 
                    required
                    className="bg-navy-950 border-navy-800 text-white"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  />
                </div>

                <Input 
                  label="Delivery Address" 
                  required 
                  placeholder="Street, City, Windhoek, etc."
                  className="bg-navy-950 border-navy-800 text-white"
                  value={formData.delivery_address}
                  onChange={e => setFormData({...formData, delivery_address: e.target.value})}
                />

                <Input 
                  label="Special Specifications or Notes" 
                  isTextArea 
                  placeholder="Bespoke sizing, wood choice, or specific finish requirements..."
                  className="bg-navy-950 border-navy-800 text-white h-32"
                  value={formData.special_notes}
                  onChange={e => setFormData({...formData, special_notes: e.target.value})}
                />

                <Button size="xl" variant="primary" className="w-full bg-gold-600 hover:bg-gold-500 text-white rounded-xl py-6 font-bold tracking-widest uppercase transition-all shadow-lg" isLoading={loading}>
                  Dispatch Inquiry
                </Button>
                
                <p className="text-[10px] text-center uppercase tracking-widest text-navy-600 font-bold">
                  Secure Encryption &bull; Premium Artisan Consultation
                </p>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-12">
            {product && (
              <Card className="bg-navy-900 border-gold-500/20 text-cream-100 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Package size={80} strokeWidth={1} />
                </div>
                <div className="space-y-8 relative z-10">
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gold-500">Commission Selection</h3>
                  <div className="flex gap-8 items-center">
                    <img 
                      src={product.images?.[0]?.storage_url || '/images/placeholder.jpg'} 
                      className="w-24 h-24 rounded-xl object-cover border border-gold-500/20" 
                      alt=""
                    />
                    <div className="space-y-2">
                      <p className="text-2xl font-serif tracking-wide text-white">{product.name}</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                        Ref: {product.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-navy-800 space-y-4">
                    <div className="flex justify-between text-xs">
                       <span className="text-navy-500 uppercase font-bold tracking-widest">Quantity</span>
                       <span className="text-white">{formData.quantity}</span>
                    </div>
                    <div className="flex justify-between text-lg font-serif">
                       <span className="text-gold-500">Estimate</span>
                       <span className="text-white tracking-widest">
                          {formatCurrency(product.price * formData.quantity * (1 + vatRate/100))}
                       </span>
                    </div>
                    <p className="text-[9px] text-navy-600 font-light italic">Estimate includes Namibian VAT ({vatRate}%).</p>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-10">
               <h3 className="section-label">Studio Assurance</h3>
               {[
                 { icon: <Package size={20} />, title: "Artisan Packing", desc: "Expertly protected for nationwide shipping within Namibia." },
                 { icon: <PhoneCall size={20} />, title: "Consultation", desc: "We contact you to verify dimensions and finishing details." },
                 { icon: <Truck size={20} />, title: "Windhoek Delivery", desc: "Professional studio-to-home installation included." },
               ].map((item, idx) => (
                 <div key={idx} className="flex gap-6 group">
                   <div className="w-14 h-14 bg-navy-900 border border-navy-800 rounded-2xl flex items-center justify-center shrink-0 text-gold-500 transition-all group-hover:bg-gold-500/10 group-hover:border-gold-500/30">
                     {item.icon}
                   </div>
                   <div className="space-y-1">
                     <h4 className="text-sm font-bold uppercase tracking-widest text-white">{item.title}</h4>
                     <p className="text-xs font-light text-navy-500 leading-relaxed italic">{item.desc}</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
