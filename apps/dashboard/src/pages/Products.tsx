import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@shared/types';
import { formatCurrency } from '@shared/utils';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*), category_rel:categories(name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch products');
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  const toggleVisibility = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_published: !product.is_published })
      .eq('id', product.id);

    if (error) {
       toast.error('Failed to update visibility');
    } else {
       setProducts(products.map(p => p.id === product.id ? { ...p, is_published: !product.is_published } : p));
       toast.success(`${product.name} ${!product.is_published ? 'published' : 'hidden'}`);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete product');
    } else {
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category_rel?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase()) // Fallback for old data
  );

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Product Archive</h1>
          <p className="text-charcoal-500 text-sm">Manage your bespoke collection and visibility.</p>
        </div>
        <Link to="/products/new">
          <button className="btn-dashboard-primary flex items-center gap-2">
            <Plus size={18} />
            Add New Piece
          </button>
        </Link>
      </header>

      {/* Toolbar */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-500" />
           <input 
             type="text" 
             placeholder="Search by name or category..." 
             className="input-base pl-12"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="bg-charcoal-800 border border-charcoal-700/50 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest text-charcoal-400">
           {filteredProducts.length} Total Pieces
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-card p-0 overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-charcoal-950/50 text-[10px] uppercase font-bold tracking-[0.2em] text-charcoal-500 border-b border-charcoal-800">
                <th className="px-8 py-5">Product Info</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5">Inventory</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-8 h-20 bg-charcoal-900/50" />
                  </tr>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const primaryImage = p.images?.find(img => img.is_primary)?.storage_url || '/images/placeholder.jpg';
                  return (
                    <tr key={p.id} className="group hover:bg-charcoal-800/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex gap-4 items-center">
                          <img src={primaryImage} className="w-12 h-16 object-cover rounded-md border border-charcoal-700" alt="" />
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-white group-hover:text-gold-400 transition-colors">{p.name}</p>
                            <p className="text-[10px] text-charcoal-500 uppercase tracking-widest leading-none truncate max-w-[200px]">ID: {p.id.slice(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-medium text-cream-100/60 uppercase tracking-widest">{p.category_rel?.name || p.category || 'General'}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-white tracking-wide">{formatCurrency(p.price)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${p.stock_quantity > 0 ? 'bg-success' : 'bg-error'}`} />
                           <span className="text-xs font-bold text-cream-100/80">{p.stock_quantity} in stock</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => toggleVisibility(p)}
                          className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                            p.is_published ? 'text-success hover:text-success/70' : 'text-charcoal-600 hover:text-gold-500'
                          }`}
                        >
                          {p.is_published ? <Eye size={14}/> : <EyeOff size={14}/>}
                          {p.is_published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/products/${p.id}/edit`}>
                            <button className="p-2 text-charcoal-500 hover:text-white transition-colors">
                              <Edit2 size={16} />
                            </button>
                          </Link>
                          <button 
                            onClick={() => deleteProduct(p.id)}
                            className="p-2 text-charcoal-500 hover:text-error transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-charcoal-500 font-serif italic text-xl">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="bg-charcoal-950/50 px-8 py-4 border-t border-charcoal-800 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-charcoal-600">
           <span>Showing {filteredProducts.length} of {products.length} products</span>
           <div className="flex gap-4">
              <button className="flex items-center gap-1 opacity-50"><ChevronLeft size={14}/> Previous</button>
              <button className="flex items-center gap-1">Next <ChevronRight size={14}/></button>
           </div>
        </div>
      </div>
    </div>
  );
};
