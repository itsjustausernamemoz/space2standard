import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Settings as SettingsType } from '@shared/types';
import { 
  Save, 
  RefreshCw, 
  Building2, 
  Percent, 
  Bell, 
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Settings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const settingsMap = data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
      setSettings(settingsMap);
    }
    setLoading(false);
  }

  const handleUpdate = async (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value
      }));

      const { error } = await supabase
        .from('settings')
        .upsert(updates);

      if (error) throw error;
      toast.success('System settings mastered.');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">System Core</h1>
          <p className="text-charcoal-500 text-sm">Configure VAT, business metadata, and artisan preferences.</p>
        </div>
        <button 
          onClick={saveAll} 
          disabled={saving} 
          className="btn-dashboard-primary flex items-center gap-2"
        >
          <Save size={18} />
          {saving ? 'Mastering...' : 'Save All Changes'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
         {/* Business Info */}
         <div className="lg:col-span-8 space-y-10">
            <div className="dashboard-card space-y-10">
               <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white flex items-center gap-2">
                  <Building2 size={16} className="text-gold-500" /> Artisan Identity
               </h3>
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1">Business Name</label>
                    <input 
                      className="input-base" 
                      value={settings.business_name || ''} 
                      onChange={e => handleUpdate('business_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1">Support Email</label>
                    <input 
                      className="input-base" 
                      value={settings.business_email || ''} 
                      onChange={e => handleUpdate('business_email', e.target.value)}
                    />
                  </div>
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1">Studio Address</label>
                  <textarea 
                    className="input-base min-h-[100px] resize-none" 
                    value={settings.business_address || ''} 
                    onChange={e => handleUpdate('business_address', e.target.value)}
                  />
               </div>

               <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1">Contact Phone</label>
                    <input 
                      className="input-base" 
                      value={settings.business_phone || ''} 
                      onChange={e => handleUpdate('business_phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1">Admin Notifications</label>
                    <input 
                      className="input-base" 
                      value={settings.admin_email || ''} 
                      onChange={e => handleUpdate('admin_email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1">Studio Website</label>
                    <input 
                      className="input-base" 
                      value={settings.business_url || 'https://space2standard.com'} 
                      onChange={e => handleUpdate('business_url', e.target.value)}
                    />
                  </div>
               </div>
            </div>

            <div className="dashboard-card space-y-10">
               <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-gold-500" /> Financial Settings
               </h3>
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1 flex items-center gap-2">
                      <Percent size={14} strokeWidth={2.5}/> VAT Rate (%)
                    </label>
                    <input 
                      type="number" 
                      className="input-base" 
                      value={settings.vat_rate || '15'} 
                      onChange={e => handleUpdate('vat_rate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500 ml-1 flex items-center gap-2">
                      <Bell size={14} strokeWidth={2.5}/> Low Stock Threshold
                    </label>
                    <input 
                      type="number" 
                      className="input-base" 
                      value={settings.low_stock_threshold || '3'} 
                      onChange={e => handleUpdate('low_stock_threshold', e.target.value)}
                    />
                  </div>
               </div>
               <div className="p-6 bg-charcoal-900/50 border border-charcoal-800 rounded-xl space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500">Security & Integrity</h4>
                  <p className="text-xs font-light text-cream-100/60 leading-relaxed font-inter italic">
                     System settings affect the calculation of all financial documents (Quotations / Invoices). 
                     Ensure your VAT rate is legally compliant with your local jurisdiction (e.g. 15% for RSA).
                  </p>
               </div>
            </div>
         </div>

         {/* Meta / Help Sidebar */}
         <div className="lg:col-span-4 space-y-8">
            <div className="dashboard-card bg-charcoal-900 border-charcoal-800 space-y-8 p-8">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-gold-500">System Information</h4>
                   <div className="space-y-3 font-inter">
                      {[
                        { label: 'Frontend Engine', val: 'Vite v6 / React 19' },
                        { label: 'Backend Nucleus', val: 'Supabase / Postgres' },
                        { label: 'PDF Engine', val: 'ReactPDF Renderer' },
                        { label: 'Security Role', val: 'Master Administrator' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px]">
                           <span className="text-charcoal-500">{item.label}</span>
                           <span className="text-white font-medium">{item.val}</span>
                        </div>
                      ))}
                   </div>
                </div>
            </div>

            <div className="p-8 border border-gold-500/10 rounded-2xl bg-gold-500/5 flex flex-col justify-center gap-6">
                <div className="flex gap-4 items-start">
                   <div className="w-10 h-10 bg-gold-500/10 text-gold-500 rounded-lg flex items-center justify-center shrink-0">
                      <ShieldCheck size={20} />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">Encrypted Core</h4>
                      <p className="text-[11px] font-light text-charcoal-500 italic">Settings are stored in the system core and protected by RLS.</p>
                   </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};
