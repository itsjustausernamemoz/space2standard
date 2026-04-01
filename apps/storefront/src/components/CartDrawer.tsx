import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import { Button } from './ui/Button';
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
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-navy-900 shadow-2xl z-50 flex flex-col border-l border-white/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-navy-800">
              <div className="flex items-center gap-3 text-gold-500">
                <ShoppingBag size={24} />
                <h2 className="text-xl font-serif text-white tracking-wide">Your Cart</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-navy-400 hover:text-white bg-navy-950 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                  <ShoppingBag size={64} className="text-navy-700" strokeWidth={1} />
                  <p className="font-serif text-2xl text-navy-400">Your cart is empty.</p>
                  <p className="text-sm text-navy-600 max-w-[200px]">Browse our artisan collection to begin your commission.</p>
                </div>
              ) : (
                items.map((item) => {
                  const imgUrl = item.product.images?.[0]?.storage_url || '/images/placeholder.jpg';
                  const unitPrice = calcDiscount(item.product.price, item.product.discount_type, item.product.discount_value);
                  
                  return (
                    <motion.div 
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-4 p-4 bg-navy-950/50 border border-navy-800 rounded-2xl group relative"
                    >
                      <img src={imgUrl} alt={item.product.name} className="w-20 h-24 object-cover rounded-xl" />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-white text-sm leading-tight pr-6">{item.product.name}</h3>
                          <button 
                            onClick={() => removeFromCart(item.product.id)}
                            className="absolute top-4 right-4 text-navy-600 hover:text-error transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <p className="text-gold-500 font-bold text-sm tracking-wide">
                          {formatCurrency(unitPrice)}
                        </p>
                        
                        <div className="flex items-center gap-3 pt-2">
                          <div className="flex items-center gap-3 bg-navy-900 border border-navy-800 rounded-lg px-2 py-1">
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="text-navy-400 hover:text-gold-500 transition-colors p-1"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-white text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="text-navy-400 hover:text-gold-500 transition-colors p-1"
                            >
                              <Plus size={12} />
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
              <div className="bg-navy-950 p-6 border-t border-navy-800 space-y-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-navy-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(taxableSubtotal)}</span>
                  </div>
                  {vatRate > 0 && (
                    <div className="flex justify-between text-sm text-navy-400">
                      <span>VAT ({vatRate}%)</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-white pt-3 border-t border-white/5">
                    <span>Total</span>
                    <span className="text-gold-500">{formatCurrency(totalInclVat)}</span>
                  </div>
                </div>

                <Button onClick={handleCheckout} variant="primary" size="xl" className="w-full bg-gold-600 hover:bg-gold-500 text-white rounded-xl">
                  Proceed to Checkout
                </Button>
                <p className="text-center text-[10px] text-navy-500 font-light italic uppercase tracking-widest">Secure Artisan Processing</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
