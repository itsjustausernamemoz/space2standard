import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', slug: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      toast.error('Failed to load categories');
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setIsEditMode(true);
      setCurrentId(cat.id);
      setFormData({ name: cat.name, slug: cat.slug });
    } else {
      setIsEditMode(false);
      setCurrentId(null);
      setFormData({ name: '', slug: '' });
    }
    setIsModalOpen(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ name: val, slug: generateSlug(val) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      if (isEditMode && currentId) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', currentId);
        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([formData]);
        if (error) throw error;
        toast.success('Category created successfully');
      }
      
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        toast.error('Failed to delete category');
      } else {
        toast.success('Category deleted');
        fetchCategories();
      }
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Categories</h1>
          <p className="text-charcoal-500 text-sm">Sort incoming artifacts into intuitive collections.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn-dashboard-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span>New Category</span>
        </button>
      </header>

      <div className="dashboard-card p-0 overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left max-w-full">
            <thead>
              <tr className="bg-charcoal-950/50 text-[10px] uppercase font-bold tracking-[0.2em] text-charcoal-500 border-b border-charcoal-800">
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5">Slug</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800 text-sm text-charcoal-300">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-charcoal-500 italic">Loading categories...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-charcoal-500 italic">No categories defined.</td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-charcoal-800/30 transition-colors">
                    <td className="px-8 py-6 font-semibold text-white">{cat.name}</td>
                    <td className="px-8 py-6 font-mono text-xs text-charcoal-500">{cat.slug}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => handleOpenModal(cat)} className="text-charcoal-500 hover:text-gold-500 transition-colors" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} className="text-charcoal-500 hover:text-error transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-charcoal-950 border border-charcoal-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-serif text-white mb-6">
              {isEditMode ? 'Edit Category' : 'New Category'}
            </h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-charcoal-500 font-bold block">Name</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  className="input-dashboard w-full"
                  placeholder="e.g. Living Room"
                  value={formData.name}
                  onChange={handleNameChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-charcoal-500 font-bold block">Slug</label>
                <input 
                  type="text" 
                  required
                  className="input-dashboard w-full bg-charcoal-900/50 text-charcoal-400 cursor-not-allowed border-transparent"
                  placeholder="e.g. living-room"
                  value={formData.slug}
                  readOnly
                />
              </div>
              <div className="flex gap-4 pt-4 border-t border-charcoal-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-charcoal-900 text-charcoal-300 rounded-xl hover:bg-charcoal-800 transition-all font-bold tracking-widest uppercase text-xs">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-gold-600 hover:bg-gold-500 text-charcoal-950 rounded-xl font-bold tracking-widest uppercase text-xs transition-all">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
