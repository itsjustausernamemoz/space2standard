import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, PlusCircle, Trash2, Search } from 'lucide-react';
import { useConfirm } from '@/components/ConfirmDialog';
import { toast } from 'react-hot-toast';

export const Gallery = () => {
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    try {
      const { data, error } = await supabase
        .from('app_gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);

    try {
      const files = Array.from(e.target.files);
      const newImages: any[] = [];

      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const rawName = file.name.replace(`.${fileExt}`, '');
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        const { data, error: dbError } = await supabase
          .from('app_gallery')
          .insert({
            name: rawName,
            storage_url: publicUrl,
          })
          .select()
          .single();
          
        if (dbError) throw dbError;
        return data;
      });

      const processedImages = await Promise.all(uploadPromises);
      setImages(prev => [...processedImages, ...prev]);
      toast.success(`${files.length} asset(s) added to gallery`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Upload failed');
    } finally {
      // Clear the input value so the same file can be triggered again if needed
      e.target.value = '';
      setUploading(false);
    }
  };

  const deleteImage = async (id: string, storageUrl: string) => {
    if (!await confirm({ title: 'Delete Asset', message: 'Remove this image from your gallery? This cannot be undone.', danger: true })) return;
    try {
      // Delete from DB
      const { error } = await supabase.from('app_gallery').delete().eq('id', id);
      if (error) throw error;
      
      // Update UI
      setImages(prev => prev.filter(img => img.id !== id));
      toast.success("Asset removed");
    } catch (err: any) {
      toast.error("Failed to delete asset");
    }
  };

  const handleListProduct = (img: any) => {
    navigate(`/products/new?gallery_url=${encodeURIComponent(img.storage_url)}&gallery_name=${encodeURIComponent(img.name)}`);
  };

  const filteredImages = images.filter(img => 
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    {dialog}
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-12"
    >
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Image Archive</h1>
          <p className="text-navy-400 text-sm italic">Standalone visual assets waiting to be assembled.</p>
        </div>
        
        <label className="btn-dashboard-primary flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all h-[42px] px-6">
          {uploading ? (
            <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          <span className="leading-none pt-0.5">{uploading ? 'Processing...' : 'Upload Assets'}</span>
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading}/>
        </label>
      </header>

      {/* Toolbar */}
      <div className="flex items-center gap-4 py-4 px-6 relative bg-navy-900/50 backdrop-blur-sm border border-navy-800/50 rounded-2xl shadow-xl">
        <Search className="text-navy-500 absolute left-6" size={18} />
        <input 
          type="text" 
          placeholder="Search gallery archives..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none text-white w-full pl-8 focus:outline-none focus:ring-0 text-sm placeholder:text-navy-600"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredImages.length === 0 ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center dashboard-card text-navy-500 border-dashed">
               <ImageIcon size={48} className="mb-4 text-navy-600" />
               <p className="font-bold uppercase tracking-[0.2em] text-sm">Empty Gallery Archive</p>
               <p className="text-xs mt-2 italic">Upload high-resolution shots to stage them for listing.</p>
            </div>
          ) : (
            filteredImages.map((img, idx) => (
              <motion.div 
                key={img.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="dashboard-card p-4 flex flex-col group hover:-translate-y-1 transition-transform relative"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-navy-950 mb-4 relative shadow-inner">
                  <img src={img.storage_url} alt={img.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-navy-950/70 py-6 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                     <button 
                       onClick={() => handleListProduct(img)}
                       className="bg-gold-500 hover:bg-gold-400 text-navy-950 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                     >
                        <PlusCircle size={14} /> List Product
                     </button>
                  </div>
                  <button 
                    onClick={() => deleteImage(img.id, img.storage_url)}
                    className="absolute top-2 right-2 p-1.5 bg-error/90 hover:bg-error text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <h3 className="text-white text-xs font-medium truncate">{img.name}</h3>
                <p className="text-navy-500 text-[10px] mt-1">{new Date(img.created_at).toLocaleDateString()}</p>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
    </>
  );
};
