import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Product } from '@shared/types';
import { formatCurrency, calcDiscount } from '@shared/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Hammer, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useStorefrontAuth } from '../contexts/StorefrontAuthContext';
import { toast } from 'react-hot-toast';
import { ScrollReveal } from '../components/ScrollReveal';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, profile } = useStorefrontAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [vatRate, setVatRate] = useState(15);

  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (profile?.full_name) {
      setReviewName(profile.full_name);
    }
  }, [profile]);

  useEffect(() => {
    async function fetchData() {
      const { data: pData, error } = await supabase
        .from('products')
        .select(`*, images:product_images(*), product_reviews(*)`)
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error(error);
        navigate('/products');
      } else {
        setProduct(pData);
      }

      const { data: sData } = await supabase.from('settings').select('*');
      const vRate = sData?.find(s => s.key === 'vat_rate')?.value;
      if (vRate) setVatRate(parseFloat(vRate));

      setLoading(false);
    }
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060b18]">
        <div className="w-8 h-8 border-[0.5px] border-[#c9a46a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const discountedPrice = calcDiscount(
    product.price,
    product.discount_type,
    product.discount_value
  );
  
  const displayPrice = vatRate > 0 ? discountedPrice * (1 + vatRate / 100) : discountedPrice;
  const originalPriceInclVat = vatRate > 0 ? product.price * (1 + vatRate / 100) : product.price;
  const hasDiscount = discountedPrice < product.price;

  const images = product.images && product.images.length > 0 
    ? [...product.images].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) 
    : [{ storage_url: '/images/placeholder.jpg', id: 'placeholder' }];

  const approvedReviews = product.product_reviews?.filter(r => r.is_approved) || [];
  const avgRating = approvedReviews.length > 0
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
    : 0;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error("Please provide a valid rating.");
      return;
    }
    setSubmittingReview(true);
    
    const submitName = user ? (reviewName.trim() || 'Anonymous User') : 'Anonymous Guest';
    const submitComment = user ? (reviewComment.trim() || null) : null;

    const { data: newReview, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: product.id,
        customer_name: submitName,
        rating: reviewRating,
        comment: submitComment,
        is_approved: true 
      })
      .select()
      .single();

    if (error) {
       console.error("Submission error:", error);
       toast.error("Failed to post Review.");
    } else {
       toast.success("Thank you for your feedback!");
       setProduct(prev => prev ? {
         ...prev, 
         product_reviews: [newReview, ...(prev.product_reviews || [])]
       } : prev);
       setReviewName('');
       setReviewComment('');
       setReviewRating(5);
    }
    setSubmittingReview(false);
  };

  return (
    <div className="pt-[56px] min-h-screen bg-[#060b18]">
      <div className="container mx-auto px-6">
        <header className="py-12">
          <Link to="/products" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a46a] hover:text-white transition-colors">
            <ChevronLeft size={14} />
            Artisan Collection
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          {/* Image Gallery */}
          <div className="space-y-8">
            <ScrollReveal>
              <div className="aspect-[4/5] relative rounded-[6px] overflow-hidden bg-[#0d1220] border border-white/5">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={images[activeImageIndex].id}
                    src={images[activeImageIndex].storage_url}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#060b18]/40 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white hover:text-[#060b18] transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={() => setActiveImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#060b18]/40 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white hover:text-[#060b18] transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>
            </ScrollReveal>

            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {images.map((img: any, idx: number) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`shrink-0 w-20 aspect-square rounded-[4px] overflow-hidden border transition-all ${
                      activeImageIndex === idx ? 'border-[#c9a46a]' : 'border-transparent opacity-40'
                    }`}
                  >
                    <img src={img.storage_url} alt={`${product.name} thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-16">
            <ScrollReveal delay={0.1}>
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">{product.category || 'Luxury Collection'}</span>
                  {product.stock_quantity <= 3 && product.stock_quantity > 0 && (
                    <span className="px-3 py-1 bg-[#c9a46a]/10 text-[#c9a46a] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#c9a46a]/20">Limited: {product.stock_quantity} left</span>
                  )}
                </div>

                <h1 className="text-[48px] md:text-[64px] font-serif text-white tracking-tight leading-[1.1]">
                  {product.name}
                </h1>

                <div className="space-y-4">
                  <div className="flex items-baseline gap-6">
                    <span className="text-[32px] font-light text-white tracking-tight">
                      {formatCurrency(displayPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xl text-[#a0a8b8] line-through font-light opacity-50">
                        {formatCurrency(originalPriceInclVat)}
                      </span>
                    )}
                  </div>
                  {vatRate > 0 && (
                     <p className="text-[12px] text-[#a0a8b8] font-light italic">Inc. {vatRate}% Namibian VAT.</p>
                  )}
                </div>

                <p className="text-[17px] font-light text-[#a0a8b8] leading-[1.8] italic max-w-xl">
                  {product.description || 'A timeless addition to any space, meticulously crafted from the finest materials.'}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-y border-white/5 py-12">
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a46a] flex items-center gap-3">
                    <Hammer size={14} /> Materiality
                  </h3>
                  <p className="text-[14px] font-light text-[#a0a8b8] leading-relaxed">
                    {product.materials || 'Sustainably sourced premium hardwood, traditional oil rub finish, artisan joinery.'}
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Specifications</h3>
                  <p className="text-[14px] font-light text-[#a0a8b8] leading-relaxed">
                    {product.dimensions || 'Approx. 220cm (L) x 100cm (W) x 75cm (H). Bespoke sizing available.'}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="space-y-12">
                <button 
                  onClick={() => addToCart(product)} 
                  className="w-full py-5 bg-[#c9a46a] text-[#060b18] rounded-[4px] text-[12px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-white"
                >
                  Add to Cart
                </button>
                
                <div className="flex flex-col gap-6 text-[10px] uppercase tracking-[0.25em] font-bold text-[#a0a8b8] opacity-60">
                  <div className="flex items-center gap-4">
                    <Truck size={14} className="text-[#c9a46a]" />
                    White-glove nationwide delivery in Namibia
                  </div>
                  <div className="flex items-center gap-4">
                    <ShieldCheck size={14} className="text-[#c9a46a]" />
                    Lifetime craftsmanship guarantee
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-[160px] border-t border-white/5 pt-[120px] pb-[160px]">
          <ScrollReveal>
            <div className="max-w-5xl mx-auto">
              <div className="text-center space-y-8 mb-24">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a46a]">Client Feedback</span>
                <h2 className="text-[40px] md:text-[56px] font-serif text-white tracking-tight">Insights</h2>
                
                {approvedReviews.length > 0 && (
                  <div className="flex justify-center items-center gap-4">
                    <div className="flex gap-1 text-[#c9a46a]">
                       {[...Array(5)].map((_, i) => (
                         <Star 
                           key={i} 
                           size={16} 
                           className={i < Math.round(avgRating) ? "fill-current" : "opacity-20"} 
                         />
                       ))}
                    </div>
                    <span className="text-[18px] font-serif text-white">{avgRating.toFixed(1)}</span>
                    <span className="text-[12px] font-light text-[#a0a8b8]">({approvedReviews.length} Reviews)</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                 {/* Testimonial List */}
                 <div className="space-y-12">
                    {approvedReviews.length === 0 ? (
                      <div className="p-12 border border-white/5 rounded-[6px] text-center italic text-[#a0a8b8] font-light">
                        No reviews yet. Be the first to grace this piece.
                      </div>
                    ) : (
                      <div className="space-y-12">
                         {approvedReviews.map((review) => (
                            <div key={review.id} className="space-y-4 pb-12 border-b border-white/5 last:border-0">
                               <div className="flex justify-between items-center">
                                  <div className="space-y-1">
                                    <p className="text-[14px] font-bold text-white uppercase tracking-widest">{review.customer_name}</p>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#a0a8b8]">{new Date(review.created_at).toLocaleDateString()}</p>
                                  </div>
                                  <div className="flex gap-0.5 text-[#c9a46a]">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        size={10} 
                                        className={i < review.rating ? "fill-current" : "opacity-20"} 
                                      />
                                    ))}
                                  </div>
                               </div>
                               {review.comment && (
                                 <p className="text-[15px] text-[#a0a8b8] leading-[1.8] italic font-light">"{review.comment}"</p>
                               )}
                            </div>
                         ))}
                      </div>
                    )}
                 </div>

                 {/* Submission Form */}
                 <div className="p-12 border border-white/10 rounded-[6px] bg-white/[0.02]">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a46a] mb-12">
                      {user ? 'Leave a Review' : 'Rate this Piece'}
                    </h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-10">
                       {user && (
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a0a8b8]">Your Name</label>
                           <input 
                             type="text" 
                             required
                             className="input-apple"
                             placeholder="Johannes Müller"
                             value={reviewName}
                             onChange={(e) => setReviewName(e.target.value)}
                           />
                         </div>
                       )}

                       <div className="space-y-4">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a0a8b8]">Overall Rating</label>
                         <div className="flex gap-3">
                           {[1, 2, 3, 4, 5].map((star) => (
                             <button
                               key={star}
                               type="button"
                               onClick={() => setReviewRating(star)}
                               className="transition-transform hover:scale-110 focus:outline-none"
                             >
                               <Star 
                                 size={24} 
                                 className={star <= reviewRating ? "text-[#c9a46a] fill-current" : "text-white/10"} 
                               />
                             </button>
                           ))}
                         </div>
                       </div>

                       {user ? (
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a0a8b8]">Your Experience</label>
                           <textarea 
                             className="input-apple h-32 resize-none"
                             placeholder="Share your thoughts on craftsmanship..."
                             value={reviewComment}
                             onChange={(e) => setReviewComment(e.target.value)}
                           />
                         </div>
                       ) : (
                         <p className="text-[12px] text-[#a0a8b8] italic font-light">
                           Login to write a detailed review. Guests can only submit ratings.
                         </p>
                       )}

                       <button 
                         type="submit" 
                         disabled={submittingReview} 
                         className="btn-apple-cta w-full py-4 shadow-sm"
                       >
                         {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                       </button>
                    </form>
                 </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
};

