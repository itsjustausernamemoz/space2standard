import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Save, 
  Building2, 
  Percent, 
  ShieldCheck,
  Mail,
  Phone,
  Globe,
  Upload,
  CreditCard,
  UserCheck,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Settings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('system-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('system-assets')
        .getPublicUrl(filePath);

      handleUpdate('business_logo_url', publicUrl);
      toast.success('Studio logo uploaded.');
    } catch (error: any) {
      toast.error('Logo upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value || ''
      }));

      const { error } = await supabase
        .from('settings')
        .upsert(updates);

      if (error) throw error;
      toast.success('Artisan identity mastered.');
    } catch (error) {
      toast.error('Failed to update system core');
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
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">System Core</h1>
          <p className="text-navy-500 text-sm italic">Configuring high-fidelity studio documentation & identity.</p>
        </div>
        <button 
          onClick={saveAll} 
          disabled={saving} 
          className="btn-dashboard-primary flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Save size={18} />
          {saving ? 'Mastering...' : 'Save Studio Config'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
         <div className="lg:col-span-8 space-y-10">
            {/* Identity & Logo */}
            <div className="dashboard-card space-y-10">
               <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white flex items-center gap-2">
                  <Building2 size={16} className="text-gold-500" /> Artisan Identity
               </h3>
               
               <div className="flex flex-col md:flex-row gap-10">
                  <div className="shrink-0 space-y-4">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Studio Logo</label>
                     <div className="relative group w-40 h-40 bg-navy-950 border-2 border-dashed border-navy-800 rounded-2xl flex items-center justify-center overflow-hidden transition-all hover:border-gold-500/50">
                        {settings.business_logo_url ? (
                          <>
                            <img src={settings.business_logo_url} alt="Logo" className="w-full h-full object-contain p-4" />
                            <button onClick={() => handleUpdate('business_logo_url', '')} className="absolute inset-0 bg-navy-950/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-error">
                               <Trash2 size={24} />
                            </button>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-2 text-navy-500 hover:text-gold-500 transition-colors">
                             {uploading ? <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /> : <Upload size={24} />}
                             <span className="text-[10px] font-bold uppercase">Upload</span>
                             <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                          </label>
                        )}
                     </div>
                  </div>

                  <div className="flex-1 space-y-8">
                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Studio Name</label>
                          <input 
                            className="input-base" 
                            value={settings.business_name || ''} 
                            placeholder="e.g. Safari Craft Studios"
                            onChange={e => handleUpdate('business_name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Support Email</label>
                          <input 
                            className="input-base" 
                            value={settings.business_email || ''} 
                            onChange={e => handleUpdate('business_email', e.target.value)}
                          />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1 flex items-center gap-2">Studio Website <Globe size={12}/></label>
                        <input 
                          className="input-base" 
                          value={settings.business_url || ''} 
                          onChange={e => handleUpdate('business_url', e.target.value)}
                        />
                     </div>
                  </div>
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Studio Base Address (Namibia)</label>
                  <textarea 
                    className="input-base min-h-[100px] resize-none" 
                    value={settings.business_address || ''} 
                    placeholder="e.g. Khomasdal, Windhoek"
                    onChange={e => handleUpdate('business_address', e.target.value)}
                  />
               </div>

               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1 flex items-center gap-2">Studio Line <Phone size={12}/></label>
                    <input 
                      className="input-base" 
                      value={settings.business_phone || ''} 
                      placeholder="+264 ..."
                      onChange={e => handleUpdate('business_phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1 flex items-center gap-2">Admin Inquiry Lead <Mail size={12}/></label>
                    <input 
                      className="input-base" 
                      value={settings.admin_email || ''} 
                      onChange={e => handleUpdate('admin_email', e.target.value)}
                    />
                  </div>
               </div>
            </div>

            {/* Banking & Finance */}
            <div className="dashboard-card space-y-10">
               <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white flex items-center gap-2">
                  <CreditCard size={16} className="text-gold-500" /> Banking Identity
               </h3>
               <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Bank Name</label>
                    <input 
                      className="input-base" 
                      value={settings.bank_name || ''} 
                      placeholder="e.g. First National Bank"
                      onChange={e => handleUpdate('bank_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Account Holder</label>
                    <input 
                      className="input-base" 
                      value={settings.bank_account_name || ''} 
                      onChange={e => handleUpdate('bank_account_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Account Number</label>
                    <input 
                      className="input-base" 
                      value={settings.bank_account_number || ''} 
                      onChange={e => handleUpdate('bank_account_number', e.target.value)}
                    />
                  </div>
               </div>
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Branch Code</label>
                    <input 
                      className="input-base" 
                      value={settings.bank_branch_code || ''} 
                      onChange={e => handleUpdate('bank_branch_code', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Default Payment Ref</label>
                    <input 
                      className="input-base" 
                      value={settings.bank_reference || ''} 
                      placeholder="e.g. Quote ID"
                      onChange={e => handleUpdate('bank_reference', e.target.value)}
                    />
                  </div>
               </div>

               <div className="gold-divider" />

               <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white flex items-center gap-2">
                  <UserCheck size={16} className="text-gold-500" /> Document Authorisation
               </h3>
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Authoriser Name</label>
                    <input 
                      className="input-base" 
                      value={settings.authorised_by_name || ''} 
                      onChange={e => handleUpdate('authorised_by_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Title / Designation</label>
                    <input 
                      className="input-base" 
                      value={settings.authorised_by_title || ''} 
                      onChange={e => handleUpdate('authorised_by_title', e.target.value)}
                    />
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-8">
            {/* VAT Config */}
            <div className="dashboard-card space-y-8">
               <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white flex items-center gap-2">
                  <Percent size={16} className="text-gold-500" /> Financial Nucleus
               </h3>
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-500 ml-1">Namibian VAT Rate (%)</label>
                    <div className="relative">
                       <input 
                         type="number" 
                         className="input-base pr-12 text-xl font-bold font-serif" 
                         value={settings.vat_rate || '15'} 
                         onChange={e => handleUpdate('vat_rate', e.target.value)}
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-600 font-bold">%</span>
                    </div>
                  </div>
                  <div className="p-4 bg-navy-950 border border-navy-800 rounded-xl space-y-3">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Auto-VAT Logic</p>
                     <p className="text-[11px] font-inter text-navy-500 italic leading-relaxed">
                        This rate is applied globally to Item Display prices on Quotations and Invoices. 
                        Changing this will affect all newly generated documents.
                     </p>
                  </div>
               </div>
            </div>

            <div className="dashboard-card bg-accent-blue/5 border-accent-blue/10 space-y-6">
                <div className="flex gap-4 items-start">
                   <div className="p-3 bg-accent-blue/20 text-accent-light rounded-xl">
                      <ShieldCheck size={20} />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">Security & Integrity</h4>
                      <p className="text-[11px] text-navy-400 font-light leading-relaxed">Identity metadata is stored in the system core and protected by Artisan Role-Level Security (RLS).</p>
                   </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};
