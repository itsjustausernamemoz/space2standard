import React, { useState, useEffect, useCallback } from 'react';
import { Globe, Megaphone, Quote, HelpCircle, FileText, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ConfirmDialog';

const sfText = { fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' };
const sfDisplay = { fontFamily: 'SF Pro Display, system-ui, -apple-system, sans-serif' };

// ── Types ────────────────────────────────────────────────────

interface Announcement {
  id: string;
  title: string;
  body: string | null;
  type: 'info' | 'promo' | 'alert' | 'news';
  cta_label: string | null;
  cta_url: string | null;
  discount_percent: number | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  announcement_products?: { product_id: string }[];
}

interface AnnouncementForm {
  title: string;
  body: string | null;
  type: 'info' | 'promo' | 'alert' | 'news';
  cta_label: string | null;
  cta_url: string | null;
  discount_percent: number | null;
  is_active: boolean;
  expires_at: string | null;
}

interface Testimonial {
  id: string;
  client_name: string;
  client_role: string | null;
  quote: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// ── Homepage content keys ────────────────────────────────────

const HOMEPAGE_KEYS = [
  { section: 'Hero', items: [
    { key: 'hero_eyebrow',       label: 'Eyebrow Text',          multiline: false },
    { key: 'hero_tagline',       label: 'Main Headline',         multiline: false },
    { key: 'hero_subtext',       label: 'Sub-headline',          multiline: false },
    { key: 'hero_cta_primary',   label: 'Primary CTA Button',    multiline: false },
    { key: 'hero_cta_secondary', label: 'Secondary CTA Button',  multiline: false },
  ]},
  { section: 'Featured Products Section', items: [
    { key: 'featured_eyebrow', label: 'Eyebrow Text',  multiline: false },
    { key: 'featured_heading', label: 'Section Heading', multiline: false },
  ]},
  { section: 'Artisan Way Section', items: [
    { key: 'artisan_eyebrow',       label: 'Eyebrow Text',     multiline: false },
    { key: 'artisan_heading',       label: 'Section Heading',  multiline: false },
    { key: 'artisan_body',          label: 'Body Paragraph',   multiline: true  },
    { key: 'artisan_block_1_title', label: 'Block 1 — Title',  multiline: false },
    { key: 'artisan_block_1_desc',  label: 'Block 1 — Detail', multiline: true  },
    { key: 'artisan_block_2_title', label: 'Block 2 — Title',  multiline: false },
    { key: 'artisan_block_2_desc',  label: 'Block 2 — Detail', multiline: true  },
    { key: 'artisan_block_3_title', label: 'Block 3 — Title',  multiline: false },
    { key: 'artisan_block_3_desc',  label: 'Block 3 — Detail', multiline: true  },
  ]},
];

// ── Shared UI ────────────────────────────────────────────────

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div style={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, ...sfText }} className={`p-6 ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    info:  { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', label: 'Info'  },
    promo: { bg: 'rgba(201,164,106,0.15)', color: '#c9a46a', label: 'Promo' },
    alert: { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', label: 'Alert' },
    news:  { bg: 'rgba(16,185,129,0.15)',  color: '#34d399', label: 'News'  },
  };
  const s = map[type] ?? map.info;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, letterSpacing: '0.05em' }}>
      {s.label.toUpperCase()}
    </span>
  );
};

const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  type?: string;
  required?: boolean;
  placeholder?: string;
}> = ({ label, value, onChange, multiline = false, rows = 3, type = 'text', required = false, placeholder }) => (
  <div className="space-y-1.5">
    <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#c9a46a', textTransform: 'uppercase' }}>
      {label}{required && ' *'}
    </label>
    {multiline ? (
      <textarea
        rows={rows}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
      />
    )}
  </div>
);

// ── Announcements Tab ─────────────────────────────────────────

const emptyAnn = (): AnnouncementForm => ({
  title: '', body: null, type: 'info', cta_label: null, cta_url: null, discount_percent: null, is_active: false, expires_at: null,
});

const AnnouncementsTab: React.FC = () => {
  const { confirm, dialog } = useConfirm();
  const [rows, setRows]             = useState<Announcement[]>([]);
  const [loading, setLoading]       = useState(true);
  const [allProducts, setAllProducts] = useState<{ id: string; name: string }[]>([]);
  const [modal, setModal] = useState<{
    open: boolean;
    data: AnnouncementForm;
    editing: string | null;
    promoProductIds: string[];
  }>({ open: false, data: emptyAnn(), editing: null, promoProductIds: [] });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('announcements')
      .select('*, announcement_products(product_id)')
      .order('created_at', { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    supabase.from('products').select('id, name').order('name')
      .then(({ data }) => setAllProducts(data ?? []));
  }, []);

  const openAdd = () => setModal({ open: true, data: emptyAnn(), editing: null, promoProductIds: [] });

  const openEdit = async (a: Announcement) => {
    const { data: links } = await supabase.from('announcement_products')
      .select('product_id').eq('announcement_id', a.id);
    setModal({
      open: true,
      data: {
        title: a.title, body: a.body, type: a.type,
        cta_label: a.cta_label, cta_url: a.cta_url,
        discount_percent: a.discount_percent,
        is_active: a.is_active, expires_at: a.expires_at,
      },
      editing: a.id,
      promoProductIds: (links ?? []).map((l: any) => l.product_id),
    });
  };

  const save = async () => {
    if (!modal.data.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    const payload = {
      ...modal.data,
      body: modal.data.body || null,
      cta_label: modal.data.cta_label || null,
      cta_url: modal.data.cta_url || null,
      expires_at: modal.data.expires_at || null,
      discount_percent: modal.data.type === 'promo' ? (modal.data.discount_percent || null) : null,
    };

    let annId: string | null = modal.editing;

    if (modal.editing) {
      // Parallelize the announcement update + old product links deletion
      const [{ error: updateErr }] = await Promise.all([
        supabase.from('announcements').update(payload).eq('id', modal.editing),
        supabase.from('announcement_products').delete().eq('announcement_id', modal.editing),
      ]);
      if (updateErr) { toast.error(updateErr.message); setSaving(false); return; }
    } else {
      const { data: created, error } = await supabase.from('announcements').insert(payload).select('id').single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      annId = created.id;
    }

    // Insert new product links (only for promos with selections)
    if (annId && modal.data.type === 'promo' && modal.promoProductIds.length > 0) {
      await supabase.from('announcement_products').insert(
        modal.promoProductIds.map(pid => ({ announcement_id: annId!, product_id: pid }))
      );
    }

    toast.success(modal.editing ? 'Updated' : 'Created');
    setModal(m => ({ ...m, open: false }));
    load();
    setSaving(false);
  };

  const toggle = async (a: Announcement) => {
    await supabase.from('announcements').update({ is_active: !a.is_active }).eq('id', a.id);
    load();
  };

  const del = async (id: string) => {
    if (!await confirm({ title: 'Delete Announcement', message: 'This announcement will be removed from the website immediately.', danger: true })) return;
    await supabase.from('announcements').delete().eq('id', id);
    toast.success('Deleted');
    load();
  };

  const set = (k: keyof AnnouncementForm, v: string | boolean | number | null) =>
    setModal(m => ({ ...m, data: { ...m.data, [k]: v } }));

  const toggleProduct = (pid: string) =>
    setModal(m => ({
      ...m,
      promoProductIds: m.promoProductIds.includes(pid)
        ? m.promoProductIds.filter(id => id !== pid)
        : [...m.promoProductIds, pid],
    }));

  const activeCount = rows.filter(r => r.is_active).length;

  return (
    <>
    {dialog}
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: '#a0a8b8', fontSize: 13 }}>{rows.length} announcements · <span style={{ color: '#34d399' }}>{activeCount} active</span></p>
        </div>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#c9a46a', color: '#000', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> New Announcement
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} style={{ height: 80, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }} className="animate-pulse" />)}</div>
      ) : rows.length === 0 ? (
        <Card><p style={{ color: '#5a6070', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No announcements yet. Create your first one.</p></Card>
      ) : (
        <div className="space-y-3">
          {rows.map(a => (
            <Card key={a.id}>
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{a.title}</span>
                    <Badge type={a.type} />
                    {a.is_active && <span style={{ fontSize: 11, color: '#34d399', fontWeight: 600 }}>● LIVE</span>}
                  </div>
                  {a.body && <p style={{ color: '#6a7080', fontSize: 13, lineHeight: 1.5 }} className="line-clamp-2">{a.body}</p>}
                  {a.cta_label && <p style={{ fontSize: 12, color: '#c9a46a' }}>CTA: {a.cta_label} → {a.cta_url}</p>}
                  {a.type === 'promo' && a.discount_percent != null && (
                    <p style={{ fontSize: 12, color: '#c9a46a', fontWeight: 600 }}>
                      {a.discount_percent}% off · {a.announcement_products?.length ?? 0} product{(a.announcement_products?.length ?? 0) !== 1 ? 's' : ''} attached
                    </p>
                  )}
                  {a.expires_at && <p style={{ fontSize: 11, color: '#5a6070' }}>Expires: {new Date(a.expires_at).toLocaleDateString()}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggle(a)} title={a.is_active ? 'Deactivate' : 'Activate'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: a.is_active ? '#34d399' : '#5a6070', padding: 4 }}>
                    {a.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button onClick={() => openEdit(a)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#a0a8b8' }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => del(a.id)} style={{ background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', ...sfText }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 600, ...sfDisplay }}>{modal.editing ? 'Edit Announcement' : 'New Announcement'}</h3>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6070' }}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <InputField label="Title" value={modal.data.title} onChange={v => set('title', v)} required placeholder="Summer Sale — 20% off all dining sets" />
              <InputField label="Body (optional)" value={modal.data.body ?? ''} onChange={v => set('body', v)} multiline placeholder="Add more details about your announcement..." />
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#c9a46a', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Type</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['info','promo','alert','news'] as const).map(t => (
                    <button key={t} onClick={() => set('type', t)} style={{ padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', borderColor: modal.data.type === t ? '#c9a46a' : 'rgba(255,255,255,0.1)', background: modal.data.type === t ? 'rgba(201,164,106,0.15)' : 'transparent', color: modal.data.type === t ? '#c9a46a' : '#6a7080', textTransform: 'capitalize' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Promo-only fields */}
              {modal.data.type === 'promo' && (
                <>
                  <InputField
                    label="Discount %"
                    value={modal.data.discount_percent != null ? String(modal.data.discount_percent) : ''}
                    onChange={v => set('discount_percent', v === '' ? null : (parseFloat(v) || null))}
                    type="number"
                    placeholder="20"
                  />
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#c9a46a', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                      Attach Products ({modal.promoProductIds.length} selected)
                    </label>
                    <div style={{ maxHeight: 190, overflowY: 'auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '6px 4px' }}>
                      {allProducts.length === 0 ? (
                        <p style={{ color: '#5a6070', fontSize: 13, padding: '8px 12px' }}>No products found.</p>
                      ) : allProducts.map(p => (
                        <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', cursor: 'pointer', borderRadius: 7 }}>
                          <input
                            type="checkbox"
                            checked={modal.promoProductIds.includes(p.id)}
                            onChange={() => toggleProduct(p.id)}
                            style={{ accentColor: '#c9a46a', width: 15, height: 15, flexShrink: 0 }}
                          />
                          <span style={{ color: modal.promoProductIds.includes(p.id) ? '#c9a46a' : '#a0a8b8', fontSize: 13 }}>{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <InputField label="CTA Button Label" value={modal.data.cta_label ?? ''} onChange={v => set('cta_label', v)} placeholder="Shop Now" />
                <InputField label="CTA URL" value={modal.data.cta_url ?? ''} onChange={v => set('cta_url', v)} placeholder="/products" />
              </div>
              <InputField label="Expires At (optional)" value={modal.data.expires_at ?? ''} onChange={v => set('expires_at', v)} type="datetime-local" />
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={modal.data.is_active} onChange={e => set('is_active', e.target.checked)} style={{ accentColor: '#c9a46a', width: 16, height: 16 }} />
                <span style={{ color: '#a0a8b8', fontSize: 14 }}>Publish immediately (make live on website)</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#a0a8b8', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: '#c9a46a', border: 'none', color: '#000', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

// ── Testimonials Tab ──────────────────────────────────────────

const emptyTest = (): Omit<Testimonial, 'id' | 'created_at'> => ({
  client_name: '', client_role: null, quote: '', rating: 5, is_featured: false, is_active: true, sort_order: 0,
});

const TestimonialsTab: React.FC = () => {
  const { confirm, dialog } = useConfirm();
  const [rows, setRows]       = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState<{ open: boolean; data: Omit<Testimonial, 'id' | 'created_at'>; editing: string | null }>({
    open: false, data: emptyTest(), editing: null,
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('testimonials').select('*').order('sort_order').order('created_at', { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => setModal({ open: true, data: emptyTest(), editing: null });
  const openEdit = (t: Testimonial) => setModal({ open: true, data: { client_name: t.client_name, client_role: t.client_role, quote: t.quote, rating: t.rating, is_featured: t.is_featured, is_active: t.is_active, sort_order: t.sort_order }, editing: t.id });

  const save = async () => {
    if (!modal.data.client_name.trim() || !modal.data.quote.trim()) { toast.error('Name and quote are required'); return; }
    setSaving(true);
    const payload = { ...modal.data, client_role: modal.data.client_role || null };
    const { error } = modal.editing
      ? await supabase.from('testimonials').update(payload).eq('id', modal.editing)
      : await supabase.from('testimonials').insert(payload);
    if (error) { toast.error(error.message); } else { toast.success(modal.editing ? 'Updated' : 'Added'); setModal(m => ({ ...m, open: false })); load(); }
    setSaving(false);
  };

  const toggle = async (t: Testimonial) => {
    await supabase.from('testimonials').update({ is_active: !t.is_active }).eq('id', t.id);
    load();
  };

  const del = async (id: string) => {
    if (!await confirm({ title: 'Delete Testimonial', message: 'This review will be permanently removed from the website.', danger: true })) return;
    await supabase.from('testimonials').delete().eq('id', id);
    toast.success('Deleted'); load();
  };

  const set = (k: keyof typeof modal.data, v: string | boolean | number | null) =>
    setModal(m => ({ ...m, data: { ...m.data, [k]: v } }));

  return (
    <>
    {dialog}
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p style={{ color: '#a0a8b8', fontSize: 13 }}>{rows.length} testimonials · <span style={{ color: '#c9a46a' }}>{rows.filter(r => r.is_featured).length} featured</span></p>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#c9a46a', color: '#000', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} style={{ height: 100, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }} className="animate-pulse" />)}</div>
      ) : rows.length === 0 ? (
        <Card><p style={{ color: '#5a6070', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No testimonials yet. Add your first client quote.</p></Card>
      ) : (
        <div className="space-y-3">
          {rows.map(t => (
            <Card key={t.id}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{t.client_name}</span>
                    {t.client_role && <span style={{ fontSize: 12, color: '#5a6070' }}>{t.client_role}</span>}
                    <span style={{ color: '#c9a46a', fontSize: 12 }}>{'★'.repeat(t.rating)}</span>
                    {t.is_featured && <span style={{ fontSize: 11, color: '#c9a46a', fontWeight: 600, background: 'rgba(201,164,106,0.12)', padding: '2px 8px', borderRadius: 6 }}>Featured</span>}
                    {!t.is_active && <span style={{ fontSize: 11, color: '#5a6070', fontWeight: 600 }}>Hidden</span>}
                  </div>
                  <p style={{ color: '#a0a8b8', fontSize: 13, fontStyle: 'italic', lineHeight: 1.5 }} className="line-clamp-2">"{t.quote}"</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggle(t)} title={t.is_active ? 'Hide' : 'Show'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.is_active ? '#34d399' : '#5a6070', padding: 4 }}>
                    {t.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button onClick={() => openEdit(t)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#a0a8b8' }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => del(t.id)} style={{ background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', ...sfText }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 600, ...sfDisplay }}>{modal.editing ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6070' }}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <InputField label="Client Name" value={modal.data.client_name} onChange={v => set('client_name', v)} required placeholder="Marc J. Kapstadt" />
                <InputField label="Role / Company" value={modal.data.client_role ?? ''} onChange={v => set('client_role', v)} placeholder="Interior Designer" />
              </div>
              <InputField label="Quote" value={modal.data.quote} onChange={v => set('quote', v)} multiline required placeholder="Exceeded all my expectations. A true heirloom." />
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#c9a46a', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Star Rating</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => set('rating', n)} style={{ fontSize: 22, cursor: 'pointer', background: 'none', border: 'none', color: n <= modal.data.rating ? '#c9a46a' : '#3a4050', padding: 0 }}>★</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={modal.data.is_featured} onChange={e => set('is_featured', e.target.checked)} style={{ accentColor: '#c9a46a', width: 15, height: 15 }} />
                  <span style={{ color: '#a0a8b8', fontSize: 13 }}>Feature on homepage</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={modal.data.is_active} onChange={e => set('is_active', e.target.checked)} style={{ accentColor: '#c9a46a', width: 15, height: 15 }} />
                  <span style={{ color: '#a0a8b8', fontSize: 13 }}>Visible on website</span>
                </label>
              </div>
              <InputField label="Sort Order" value={String(modal.data.sort_order)} onChange={v => set('sort_order', parseInt(v) || 0)} type="number" placeholder="0" />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#a0a8b8', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: '#c9a46a', border: 'none', color: '#000', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

// ── FAQs Tab ──────────────────────────────────────────────────

const emptyFaq = (): Omit<Faq, 'id' | 'created_at'> => ({
  question: '', answer: '', category: 'General', sort_order: 0, is_active: true,
});

const FaqsTab: React.FC = () => {
  const { confirm, dialog } = useConfirm();
  const [rows, setRows]       = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modal, setModal]     = useState<{ open: boolean; data: Omit<Faq, 'id' | 'created_at'>; editing: string | null }>({
    open: false, data: emptyFaq(), editing: null,
  });
  const [saving, setSaving] = useState(false);

  const FAQ_CATEGORIES = ['General', 'Products', 'Ordering', 'Delivery', 'Care & Maintenance', 'Pricing', 'Custom Orders'];

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('faqs').select('*').order('category').order('sort_order').order('created_at');
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => setModal({ open: true, data: emptyFaq(), editing: null });
  const openEdit = (f: Faq) => setModal({ open: true, data: { question: f.question, answer: f.answer, category: f.category, sort_order: f.sort_order, is_active: f.is_active }, editing: f.id });

  const save = async () => {
    if (!modal.data.question.trim() || !modal.data.answer.trim()) { toast.error('Question and answer are required'); return; }
    setSaving(true);
    const { error } = modal.editing
      ? await supabase.from('faqs').update(modal.data).eq('id', modal.editing)
      : await supabase.from('faqs').insert(modal.data);
    if (error) { toast.error(error.message); } else { toast.success(modal.editing ? 'Updated' : 'Added'); setModal(m => ({ ...m, open: false })); load(); }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!await confirm({ title: 'Delete FAQ', message: 'This question will be permanently removed from the website.', danger: true })) return;
    await supabase.from('faqs').delete().eq('id', id);
    toast.success('Deleted'); load();
  };

  const toggle = async (f: Faq) => {
    await supabase.from('faqs').update({ is_active: !f.is_active }).eq('id', f.id);
    load();
  };

  const set = (k: keyof typeof modal.data, v: string | boolean | number) =>
    setModal(m => ({ ...m, data: { ...m.data, [k]: v } }));

  const categories = [...new Set(rows.map(r => r.category))];

  return (
    <>
    {dialog}
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p style={{ color: '#a0a8b8', fontSize: 13 }}>{rows.length} questions across {categories.length} categories</p>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#c9a46a', color: '#000', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Add FAQ
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} style={{ height: 64, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }} className="animate-pulse" />)}</div>
      ) : rows.length === 0 ? (
        <Card><p style={{ color: '#5a6070', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No FAQs yet. Add your first question.</p></Card>
      ) : (
        <div className="space-y-2">
          {rows.map(f => (
            <div key={f.id} style={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }} onClick={() => setExpanded(expanded === f.id ? null : f.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ color: f.is_active ? '#fff' : '#5a6070', fontSize: 14, fontWeight: 500 }}>{f.question}</span>
                    <span style={{ fontSize: 11, color: '#5a6070', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 6 }}>{f.category}</span>
                    {!f.is_active && <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>Hidden</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button onClick={e => { e.stopPropagation(); toggle(f); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: f.is_active ? '#34d399' : '#5a6070', padding: 4 }}>
                    {f.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={e => { e.stopPropagation(); openEdit(f); }} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', color: '#a0a8b8' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); del(f.id); }} style={{ background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={13} />
                  </button>
                  {expanded === f.id ? <ChevronUp size={16} color="#5a6070" /> : <ChevronDown size={16} color="#5a6070" />}
                </div>
              </div>
              {expanded === f.id && (
                <div style={{ padding: '0 16px 16px', color: '#a0a8b8', fontSize: 13, lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ paddingTop: 12 }}>{f.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', ...sfText }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 600, ...sfDisplay }}>{modal.editing ? 'Edit FAQ' : 'New FAQ'}</h3>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6070' }}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <InputField label="Question" value={modal.data.question} onChange={v => set('question', v)} required placeholder="How long does a custom piece take to make?" />
              <InputField label="Answer" value={modal.data.answer} onChange={v => set('answer', v)} multiline rows={4} required placeholder="Typically 4–8 weeks depending on complexity..." />
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#c9a46a', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Category</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {FAQ_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => set('category', cat)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: '1px solid', borderColor: modal.data.category === cat ? '#c9a46a' : 'rgba(255,255,255,0.1)', background: modal.data.category === cat ? 'rgba(201,164,106,0.15)' : 'transparent', color: modal.data.category === cat ? '#c9a46a' : '#6a7080' }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <InputField label="Sort Order" value={String(modal.data.sort_order)} onChange={v => set('sort_order', parseInt(v) || 0)} type="number" />
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', alignSelf: 'end', paddingBottom: 2 }}>
                  <input type="checkbox" checked={modal.data.is_active} onChange={e => set('is_active', e.target.checked)} style={{ accentColor: '#c9a46a', width: 15, height: 15 }} />
                  <span style={{ color: '#a0a8b8', fontSize: 13 }}>Visible on website</span>
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#a0a8b8', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: '#c9a46a', border: 'none', color: '#000', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

// ── Homepage Text Tab ─────────────────────────────────────────

const HomepageTextTab: React.FC = () => {
  const [content, setContent]   = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    supabase.from('site_content').select('key, value').then(({ data }) => {
      const map: Record<string, string> = {};
      (data ?? []).forEach((r: { key: string; value: string | null }) => { map[r.key] = r.value ?? ''; });
      setContent(map);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const upserts = Object.entries(content).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('site_content').upsert(upserts, { onConflict: 'key' });
    if (error) { toast.error(error.message); } else { toast.success('Homepage content saved'); }
    setSaving(false);
  };

  if (loading) {
    return <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} style={{ height: 60, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }} className="animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-8">
      <div style={{ background: 'rgba(201,164,106,0.08)', border: '1px solid rgba(201,164,106,0.2)', borderRadius: 12, padding: '12px 16px' }}>
        <p style={{ color: '#c9a46a', fontSize: 13 }}>Changes here update the live website immediately after saving. Visitors will see the new text on their next page load.</p>
      </div>

      {HOMEPAGE_KEYS.map(section => (
        <div key={section.section}>
          <h4 style={{ color: '#c9a46a', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>{section.section}</h4>
          <Card className="space-y-4">
            {section.items.map(item => (
              <InputField
                key={item.key}
                label={item.label}
                value={content[item.key] ?? ''}
                onChange={v => setContent(c => ({ ...c, [item.key]: v }))}
                multiline={item.multiline}
                rows={item.multiline ? 2 : undefined}
              />
            ))}
          </Card>
        </div>
      ))}

      <div style={{ position: 'sticky', bottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#c9a46a', color: '#000', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 32px rgba(201,164,106,0.3)' }}>
          <Save size={15} /> {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────

type Tab = 'announcements' | 'testimonials' | 'faqs' | 'homepage';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'announcements', label: 'Announcements', icon: <Megaphone size={15} /> },
  { id: 'testimonials',  label: 'Testimonials',  icon: <Quote size={15} /> },
  { id: 'faqs',          label: 'FAQs',           icon: <HelpCircle size={15} /> },
  { id: 'homepage',      label: 'Homepage Text',  icon: <FileText size={15} /> },
];

export const WebsiteContent: React.FC = () => {
  const [tab, setTab] = useState<Tab>('announcements');

  return (
    <div style={{ padding: '32px 32px 64px', minHeight: '100vh', background: '#060b18', ...sfText }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, background: 'rgba(201,164,106,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={18} color="#c9a46a" />
          </div>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 600, letterSpacing: '-0.28px', ...sfDisplay }}>Website Content</h1>
        </div>
        <p style={{ color: '#5a6070', fontSize: 14 }}>Manage everything visible on the customer-facing website.</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: '#0d1220', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.15s', background: tab === t.id ? 'rgba(201,164,106,0.15)' : 'transparent', color: tab === t.id ? '#c9a46a' : '#5a6070', ...sfText }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'announcements' && <AnnouncementsTab />}
      {tab === 'testimonials'  && <TestimonialsTab />}
      {tab === 'faqs'          && <FaqsTab />}
      {tab === 'homepage'      && <HomepageTextTab />}
    </div>
  );
};
