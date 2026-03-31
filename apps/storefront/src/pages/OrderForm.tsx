import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Product } from '@shared/types';
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
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    special_notes: '',
    quantity: 1
  });

  useEffect(() => {
    if (productId) {
      async function fetchProduct() {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
        if (data) setProduct(data);
      }
      fetchProduct();
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          delivery_address: formData.delivery_address,
          special_notes: formData.special_notes,
          status: 'new'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Add the order item
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: product?.id || null,
          product_name_snapshot: product?.name || 'Custom Consultation',
          unit_price_snapshot: product?.price || 0,
          quantity: formData.quantity,
          discount_applied: 0 // Simplification for now
        });

      if (itemError) throw itemError;

      setSubmitted(true);
      toast.success('Our artisan has received your order.');
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-60 pb-40 px-6 container mx-auto text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl mx-auto space-y-12"
        >
          <div className="w-24 h-24 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-gold-500" size={48} strokeWidth={1} />
          </div>
          <div className="space-y-6">
            <h1 className="text-5xl font-serif text-walnut-950 tracking-tight">Handled with Care</h1>
            <p className="text-lg font-light text-charcoal-600 leading-relaxed max-w-xl mx-auto italic">
              Thank you, {formData.customer_name}. We have received your request for 
              <span className="text-gold-500 font-medium"> {product?.name || 'a custom piece'}</span>. 
              Our master artisan will contact you within 24 hours to discuss your masterpiece.
            </p>
          </div>
          <div className="gold-divider" />
          <Button onClick={() => navigate('/products')} variant="outline" className="px-12">
            Back to Collection
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 min-h-screen bg-cream-50">
      <div className="container mx-auto px-6 max-w-6xl">
        <header className="mb-24 space-y-6 text-center max-w-3xl mx-auto">
          <span className="section-label">Bespoke Journey</span>
          <h1 className="text-6xl font-serif text-walnut-950 tracking-tight">Begin Your Order</h1>
          <p className="text-lg font-light text-charcoal-700 leading-relaxed italic">
            Each piece is custom-made. No payment is required now — 
            we will contact you to finalise dimensions and finish.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
          {/* Order Form */}
          <div className="lg:col-span-7">
            <Card variant="solid" className="bg-white/80 p-12">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <Input 
                    label="Full Name" 
                    required 
                    placeholder="Enter your name"
                    value={formData.customer_name}
                    onChange={e => setFormData({...formData, customer_name: e.target.value})}
                  />
                  <Input 
                    label="Email Address" 
                    type="email" 
                    required 
                    placeholder="example@email.com"
                    value={formData.customer_email}
                    onChange={e => setFormData({...formData, customer_email: e.target.value})}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-10">
                  <Input 
                    label="Phone Number" 
                    required 
                    placeholder="+27..."
                    value={formData.customer_phone}
                    onChange={e => setFormData({...formData, customer_phone: e.target.value})}
                  />
                  <Input 
                    label="Quantity" 
                    type="number" 
                    min="1" 
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  />
                </div>

                <Input 
                  label="Delivery Address" 
                  required 
                  placeholder="Street, City, Postcode"
                  value={formData.delivery_address}
                  onChange={e => setFormData({...formData, delivery_address: e.target.value})}
                />

                <Input 
                  label="Special Requests or Notes" 
                  isTextArea 
                  placeholder="Bespoke sizing, wood choice, or specific finish requirements..."
                  value={formData.special_notes}
                  onChange={e => setFormData({...formData, special_notes: e.target.value})}
                />

                <Button size="xl" variant="primary" className="w-full" isLoading={loading}>
                  Submit Inquiry
                </Button>
                
                <p className="text-[10px] text-center uppercase tracking-widest text-charcoal-400 font-bold">
                  Secure Submission &bull; No upfront payment required
                </p>
              </form>
            </Card>
          </div>

          {/* Context / Preview Sidebar */}
          <div className="lg:col-span-5 space-y-12">
            {product && (
              <Card className="bg-walnut-800 text-gold-300">
                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gold-500">Selected Piece</h3>
                  <div className="flex gap-6 items-center">
                    <img 
                      src={product.images?.[0]?.storage_url || '/images/placeholder.jpg'} 
                      className="w-20 h-20 rounded-lg object-cover border border-gold-500/20" 
                      alt=""
                    />
                    <div className="space-y-1">
                      <p className="text-xl font-serif tracking-wide">{product.name}</p>
                      <p className="text-sm font-bold opacity-60 uppercase tracking-widest">
                        Ref: {product.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-8">
               <h3 className="section-label">Trust & Quality</h3>
               {[
                 { icon: <Package size={18} />, title: "Artisan Packing", desc: "Expertly protected for nationwide shipping." },
                 { icon: <PhoneCall size={18} />, title: "Personal Consultation", desc: "We contact you to verify every detail." },
                 { icon: <Truck size={18} />, title: "White-Glove Delivery", desc: "Professional installation included." },
               ].map((item, idx) => (
                 <div key={idx} className="flex gap-6 group">
                   <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center shrink-0 text-gold-500 transition-colors group-hover:bg-gold-500 group-hover:text-white">
                     {item.icon}
                   </div>
                   <div className="space-y-1">
                     <h4 className="text-sm font-bold uppercase tracking-widest text-walnut-950">{item.title}</h4>
                     <p className="text-xs font-light text-charcoal-500 leading-relaxed italic">{item.desc}</p>
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
