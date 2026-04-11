import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatCurrency, calcDiscount } from '@shared/utils';
import { useNavigate } from 'react-router-dom';

export const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const vatRate = settings.vat_rate ? parseFloat(settings.vat_rate) : 0;
  const taxableSubtotal = cartTotal;
  const taxAmount = (taxableSubtotal * vatRate) / 100;
  const totalInclVat = taxableSubtotal + taxAmount;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/order');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-[#060b18]/80 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#060b18] shadow-2xl z-50 flex flex-col border-l border-white/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-white/5">
              <div className="flex items-center gap-4 text-[#c9a46a]">
                <ShoppingBag size={20} />
                <h2 className="text-[24px] font-serif text-white tracking-tight">Your Cart</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 flex items-center justify-center text-[#a0a8b8] hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-30">
                  <ShoppingBag size={64} className="text-white" strokeWidth={1} />
                  <div className="space-y-2">
                    <p className="font-serif text-[24px] text-white tracking-tight">Empty</p>
                    <p className="text-[12px] text-[#a0a8b8] uppercase tracking-[0.2em]">Browse the collection</p>
                  </div>
                </div>
              ) : (
                items.map((item) => {
                  const imgUrl = item.product.images?.[0]?.storage_url || '/images/placeholder.jpg';
                  const unitPrice = calcDiscount(item.product.price, item.product.discount_type, item.product.discount_value);
                  
                  return (
                    <motion.div 
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="flex gap-6 pb-8 border-b border-white/5 last:border-0 group relative"
                    >
                      <div className="w-20 h-24 bg-[#0d1220] border border-white/5 rounded-[4px] overflow-hidden shrink-0">
                        <img src={imgUrl} alt={item.product.name} className="w-full h-full object-cover opacity-80" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-bold text-white text-[14px] leading-tight pr-8">{item.product.name}</h3>
                          <button 
                            onClick={() => removeFromCart(item.product.id)}
                            className="absolute top-0 right-0 text-[#a0a8b8] hover:text-[#c9a46a] transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        <p className="text-[#c9a46a] font-serif text-[16px]">
                          {formatCurrency(unitPrice)}
                        </p>
                        
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-4 border border-white/10 rounded-full px-4 py-1">
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="text-[#a0a8b8] hover:text-white transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="text-white text-[12px] font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="text-[#a0a8b8] hover:text-white transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="bg-[#060b18] p-8 border-t border-white/5 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between text-[12px] text-[#a0a8b8]">
                    <span className="uppercase tracking-[0.2em] font-bold">Subtotal</span>
                    <span>{formatCurrency(taxableSubtotal)}</span>
                  </div>
                  {vatRate > 0 && (
                    <div className="flex justify-between text-[12px] text-[#a0a8b8]">
                      <span className="uppercase tracking-[0.2em] font-bold">VAT ({vatRate}%)</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[24px] font-serif text-white pt-4 border-t border-white/10">
                    <span className="text-[#c9a46a]">Total</span>
                    <span className="tracking-tight">{formatCurrency(totalInclVat)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout} 
                  className="btn-apple-cta w-full py-5"
                >
                  Proceed to Checkout
                </button>
                <p className="text-center text-[10px] text-[#a0a8b8] opacity-50 font-light uppercase tracking-[0.2em]">Secure Processing</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

