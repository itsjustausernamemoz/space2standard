import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { ProductImage } from '@shared/types';
import { 
  ChevronLeft, 
  Save, 
  Upload, 
  X, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SelectField } from '@/components/SelectField';

export const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [images, setImages] = useState<Partial<ProductImage>[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [convCurrency, setConvCurrency] = useState('USD');
  const [convAmount, setConvAmount] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    dimensions: '',
    materials: '',
    price: 0,
    stock_quantity: 0,
    is_published: false,
    is_featured: false,
    discount_type: null as 'percent' | 'fixed' | null,
    discount_value: 0
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit && id) {
      fetchProduct(id);
    } else {
      const galleryUrl = searchParams.get('gallery_url');
      const galleryName = searchParams.get('gallery_name');
      
      if (galleryUrl && galleryName) {
        setFormData(prev => ({ ...prev, name: galleryName }));
        setImages([{
          storage_url: galleryUrl,
          is_primary: true,
          sort_order: 0
        }]);
      }
    }
  }, [isEdit, id, searchParams]);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  }

  async function fetchProduct(productId: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`*, images:product_images(*)`)
      .eq('id', productId)
      .single();

    if (error) {
      toast.error('Failed to load product');
      navigate('/products');
    } else {
      setFormData({
        name: data.name,
        category_id: data.category_id || '',
        description: data.description || '',
        dimensions: data.dimensions || '',
        materials: data.materials || '',
        price: data.price,
        stock_quantity: data.stock_quantity,
        is_published: data.is_published,
        is_featured: data.is_featured,
        discount_type: data.discount_type,
        discount_value: data.discount_value || 0
      });
      setImages(data.images || []);
    }
    setFetching(false);
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);

    try {
      const files = Array.from(e.target.files);
      const newImages: Partial<ProductImage>[] = [...images];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        newImages.push({
          storage_url: publicUrl,
          is_primary: newImages.length === 0,
          sort_order: newImages.length
        });
      }

      setImages(newImages);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image(s)');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    // Note: In a real app, you might want to also delete from Supabase Storage
  };

  const setPrimaryImage = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, is_primary: i === index })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productPayload = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      let productId = id;

      if (isEdit) {
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productPayload)
          .select()
          .single();
        if (error) throw error;
        productId = data.id;
      }

      // Sync images
      // Simple strategy: delete all current images for this product and re-insert
      if (isEdit) {
        await supabase.from('product_images').delete().eq('product_id', productId);
      }

      if (images.length > 0) {
        const imagesPayload = images.map(img => ({
          product_id: productId,
          storage_url: img.storage_url,
          is_primary: img.is_primary,
          sort_order: img.sort_order
        }));

        const { error: imgError } = await supabase
          .from('product_images')
          .insert(imagesPayload);
        
        if (imgError) throw imgError;
      }

      toast.success(isEdit ? 'Product updated' : 'Product created');
      navigate('/products');
    } catch (error: any) {
      toast.error(error.message || 'Error saving product');
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
    <div className="space-y-12">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <Link to="/products" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal-500 hover:text-gold-500 transition-colors mb-4">
            <ChevronLeft size={14} /> Back to List
          </Link>
          <h1 className="text-3xl font-serif text-white tracking-tight">
            {isEdit ? `Edit: ${formData.name}` : 'New Bespoke Piece'}
          </h1>
          <p className="text-charcoal-500 text-sm">Define the specifications of your masterpiece.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => navigate('/products')} className="btn-dashboard-ghost">
             Cancel
           </button>
           <button onClick={handleSubmit} disabled={loading} className="btn-dashboard-primary flex items-center gap-2">
             <Save size={18} />
             {loading ? 'Saving...' : (isEdit ? 'Update Piece' : 'Create Piece')}
           </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Info */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8">
           <div className="dashboard-card space-y-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1">Piece Name</label>
                  <input 
                    className="input-base" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1">Category</label>
                  <SelectField
                    className="input-base"
                    value={formData.category_id}
                    onChange={v => setFormData({...formData, category_id: v})}
                    placeholder="Select a Category..."
                    options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1">Artisan Description</label>
                <textarea 
                  className="input-base min-h-[160px] resize-none" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Describe the inspiration and craftsmanship details..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1">Materials Used</label>
                  <input 
                    className="input-base" 
                    value={formData.materials} 
                    onChange={e => setFormData({...formData, materials: e.target.value})} 
                    placeholder="e.g. Solid Walnut, Brass Inlays"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1">Bespoke Dimensions</label>
                  <input 
                    className="input-base" 
                    value={formData.dimensions} 
                    onChange={e => setFormData({...formData, dimensions: e.target.value})} 
                    placeholder="e.g. 2400 x 1100 mm"
                  />
                </div>
              </div>
           </div>

           {/* Pricing & Inventory */}
           <div className="dashboard-card space-y-10">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white flex items-center gap-2">
                 <AlertCircle size={16} className="text-gold-500" /> Commercial Configuration
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1">Base Price (N$)</label>
                    <input
                      type="number"
                      className="input-base"
                      required
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1">Stock Availability</label>
                    <input 
                      type="number" 
                      className="input-base" 
                      required 
                      value={formData.stock_quantity} 
                      onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})} 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1">Discount Config</label>
                    <div className="flex gap-2">
                      <SelectField
                        className="input-base !w-1/3"
                        value={formData.discount_type || ''}
                        onChange={v => setFormData({...formData, discount_type: (v as any) || null})}
                        options={[
                          { value: '',       label: 'None' },
                          { value: 'percent', label: '%' },
                          { value: 'fixed',   label: 'Fixed' },
                        ]}
                      />
                      <input
                        type="number"
                        className="input-base !w-2/3"
                        value={formData.discount_value}
                        onChange={e => setFormData({...formData, discount_value: parseFloat(e.target.value)})}
                      />
                    </div>
                 </div>
              </div>

              {/* Currency converter helper */}
              {(() => {
                const RATES: Record<string, { rate: number; name: string }> = {
                  USD: { rate: 18.5, name: 'US Dollar' },
                  EUR: { rate: 20.2, name: 'Euro' },
                  GBP: { rate: 23.8, name: 'British Pound' },
                  ZAR: { rate: 1.0,  name: 'South African Rand' },
                  BWP: { rate: 1.35, name: 'Botswana Pula' },
                };
                const nadEq = convAmount && !isNaN(parseFloat(convAmount))
                  ? (parseFloat(convAmount) * RATES[convCurrency].rate).toFixed(2)
                  : null;
                return (
                  <div style={{ background: 'rgba(201,164,106,0.04)', border: '1px solid rgba(201,164,106,0.14)', borderRadius: 12, padding: '14px 18px' }}>
                    <p style={{ fontSize: 10, color: '#c9a46a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                      Convert from foreign currency → N$
                    </p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <SelectField
                        value={convCurrency}
                        onChange={setConvCurrency}
                        options={Object.entries(RATES).map(([k, v]) => ({ value: k, label: `${k} – ${v.name}` }))}
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif', fontSize: 13, padding: '9px 13px', outline: 'none', minWidth: 200 }}
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={convAmount}
                        onChange={e => setConvAmount(e.target.value)}
                        placeholder={`Amount in ${convCurrency}`}
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif', fontSize: 13, padding: '9px 13px', outline: 'none', flex: 1, minWidth: 140 }}
                      />
                      {nadEq && (
                        <button
                          type="button"
                          onClick={() => { setFormData(fd => ({ ...fd, price: parseFloat(nadEq) })); setConvAmount(''); }}
                          style={{ background: '#c9a46a', border: 'none', borderRadius: 10, padding: '9px 18px', color: '#060b18', fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          Apply N$ {parseFloat(nadEq).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: '#5a6070', marginTop: 8 }}>
                      Rate: 1 {convCurrency} ≈ N$ {RATES[convCurrency].rate.toFixed(2)} · Approximate — update via your bank or forex provider
                    </p>
                  </div>
                );
              })()}

              <div className="flex gap-12 items-center bg-charcoal-900/50 p-6 rounded-xl border border-charcoal-700/30">
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-gold-500" 
                      checked={formData.is_published} 
                      onChange={e => setFormData({...formData, is_published: e.target.checked})} 
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cream-100/60 group-hover:text-gold-500 transition-colors">Published Storefront</span>
                 </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-gold-500" 
                      checked={formData.is_featured} 
                      onChange={e => setFormData({...formData, is_featured: e.target.checked})} 
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cream-100/60 group-hover:text-gold-500 transition-colors">Featured on Home</span>
                 </label>
              </div>
           </div>
        </div>

        {/* Media Management */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-8">
           <div className="dashboard-card space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white">Visual Archive</h3>
                 <label className="text-[10px] font-bold uppercase tracking-widest text-gold-500 hover:text-gold-400 cursor-pointer flex items-center gap-2 transition-colors">
                    <Upload size={14} /> Upload
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading}/>
                 </label>
              </div>

              {uploading && (
                <div className="h-40 bg-charcoal-900 border border-charcoal-700/50 border-dashed rounded-xl flex items-center justify-center animate-pulse">
                   <div className="flex flex-col items-center gap-3 text-gold-500">
                      <ImageIcon size={32} className="animate-bounce" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Mastering Images...</span>
                   </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-[4/5] bg-charcoal-900 rounded-xl overflow-hidden border border-charcoal-700 group">
                       <img src={img.storage_url} className="w-full h-full object-cover" alt="" />
                       
                       <div className="absolute inset-0 bg-charcoal-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                          <button 
                            type="button" 
                            onClick={() => removeImage(idx)}
                            className="self-end p-2 bg-error/20 text-error rounded-lg hover:bg-error hover:text-white transition-all shadow-xl"
                          >
                             <Trash2 size={14} />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setPrimaryImage(idx)}
                            className={`w-full py-2 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all ${
                               img.is_primary ? 'bg-gold-500 text-charcoal-950' : 'bg-charcoal-800 text-gold-500 hover:bg-charcoal-700'
                            }`}
                          >
                             {img.is_primary ? 'Primary Set' : 'Set Primary'}
                          </button>
                       </div>

                       {img.is_primary && (
                         <div className="absolute top-2 left-2 p-1.5 bg-gold-500 text-charcoal-950 rounded-full shadow-lg">
                           <CheckCircle2 size={12} />
                         </div>
                       )}
                    </div>
                 ))}
                 
                 {images.length === 0 && !uploading && (
                   <div className="col-span-2 h-60 bg-charcoal-900 border-2 border-charcoal-800 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 text-charcoal-600 italic">
                      <ImageIcon size={40} className="text-charcoal-800" strokeWidth={1} />
                      <p className="text-xs">No visual assets attached.</p>
                   </div>
                 )}
              </div>
              
              <div className="p-6 bg-gold-500/5 rounded-xl border border-gold-500/10 text-xs font-light text-gold-500/80 leading-relaxed italic">
                 Recommendation: Use professional, high-resolution photography with neutral backgrounds to evoke luxury.
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};
