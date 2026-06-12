import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { SelectField } from '@/components/SelectField';
import { useConfirm } from '@/components/ConfirmDialog';
import {
  Plus, X, Search, Truck, Edit2, Trash2,
  RefreshCw, Phone, Mail, MapPin, Package,
  ClipboardList, ChevronDown, ChevronUp
} from 'lucide-react';

const sfDisplay = 'SF Pro Display, system-ui, -apple-system, sans-serif';
const sfText    = 'SF Pro Text, system-ui, -apple-system, sans-serif';
const sfMono    = 'SF Mono, ui-monospace, monospace';

interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  materials?: string;
  payment_terms?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

interface POItem { description: string; quantity: number; unit_price: number; }
interface PO {
  id: string;
  supplier_id?: string;
  suppliers?: { name: string };
  po_number?: string;
  status: string;
  items: POItem[];
  total_amount: number;
  expected_delivery?: string;
  notes?: string;
  created_at: string;
}

const PO_STATUSES = [
  { key: 'draft',     label: 'Draft',     color: '#5a6070' },
  { key: 'sent',      label: 'Sent',      color: '#3b82f6' },
  { key: 'received',  label: 'Received',  color: '#22c55e' },
  { key: 'partial',   label: 'Partial',   color: '#f97316' },
  { key: 'cancelled', label: 'Cancelled', color: '#ef4444' },
];

const statusColor = (s: string) => PO_STATUSES.find(x => x.key === s)?.color || '#5a6070';
const statusLabel = (s: string) => PO_STATUSES.find(x => x.key === s)?.label || s;

const fmt = (n: number) => `N$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const emptySupplier = { name: '', contact_name: '', email: '', phone: '', address: '', materials: '', payment_terms: '', notes: '', is_active: true };
const emptyPO = { supplier_id: '', po_number: '', status: 'draft', items: [{ description: '', quantity: 1, unit_price: 0 }] as POItem[], total_amount: 0, expected_delivery: '', notes: '' };

export const Suppliers = () => {
  const { confirm, dialog } = useConfirm();
  const [tab, setTab] = useState<'suppliers' | 'orders'>('suppliers');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pos, setPOs] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [supplierModal, setSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [sForm, setSForm] = useState({ ...emptySupplier });

  const [poModal, setPOModal] = useState(false);
  const [editingPO, setEditingPO] = useState<PO | null>(null);
  const [poForm, setPOForm] = useState({ ...emptyPO });

  const [saving, setSaving] = useState(false);
  const [expandedPO, setExpandedPO] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from('suppliers').select('*').order('name'),
      supabase.from('purchase_orders').select('*, suppliers(name)').order('created_at', { ascending: false }),
    ]);
    setSuppliers(s || []);
    setPOs(p || []);
    setLoading(false);
  };

  const filteredSuppliers = suppliers.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.materials?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredPOs = pos.filter(p =>
    !search || p.po_number?.toLowerCase().includes(search.toLowerCase()) ||
    p.suppliers?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Supplier CRUD
  const openAddSupplier = () => { setEditingSupplier(null); setSForm({ ...emptySupplier }); setSupplierModal(true); };
  const openEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setSForm({ name: s.name, contact_name: s.contact_name || '', email: s.email || '', phone: s.phone || '', address: s.address || '', materials: s.materials || '', payment_terms: s.payment_terms || '', notes: s.notes || '', is_active: s.is_active });
    setSupplierModal(true);
  };
  const saveSupplier = async () => {
    if (!sForm.name.trim()) { toast.error('Supplier name required'); return; }
    setSaving(true);
    const payload = { name: sForm.name.trim(), contact_name: sForm.contact_name || null, email: sForm.email || null, phone: sForm.phone || null, address: sForm.address || null, materials: sForm.materials || null, payment_terms: sForm.payment_terms || null, notes: sForm.notes || null, is_active: sForm.is_active };
    if (editingSupplier) {
      const { error } = await supabase.from('suppliers').update(payload).eq('id', editingSupplier.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...payload } as Supplier : s));
    } else {
      const { data, error } = await supabase.from('suppliers').insert(payload).select('*').single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      setSuppliers(prev => [...prev, data as Supplier]);
    }
    toast.success(editingSupplier ? 'Supplier updated' : 'Supplier added');
    setSupplierModal(false);
    setSaving(false);
  };
  const deleteSupplier = async (id: string) => {
    if (!await confirm({ title: 'Delete Supplier', message: 'This supplier and all associated data will be permanently removed.', danger: true })) return;
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    setSuppliers(prev => prev.filter(s => s.id !== id));
    toast.success('Supplier deleted');
  };

  // PO CRUD
  const recalcTotal = (items: POItem[]) => items.reduce((s, i) => s + (i.quantity * i.unit_price), 0);
  const openAddPO = () => { setEditingPO(null); setPOForm({ ...emptyPO }); setPOModal(true); };
  const openEditPO = (p: PO) => {
    setEditingPO(p);
    setPOForm({ supplier_id: p.supplier_id || '', po_number: p.po_number || '', status: p.status, items: p.items.length ? p.items : [{ description: '', quantity: 1, unit_price: 0 }], total_amount: p.total_amount, expected_delivery: p.expected_delivery || '', notes: p.notes || '' });
    setPOModal(true);
  };
  const savePO = async () => {
    if (!poForm.supplier_id) { toast.error('Select a supplier'); return; }
    setSaving(true);
    const total = recalcTotal(poForm.items.filter(i => i.description));
    const payload = { supplier_id: poForm.supplier_id || null, po_number: poForm.po_number || null, status: poForm.status, items: poForm.items.filter(i => i.description), total_amount: total, expected_delivery: poForm.expected_delivery || null, notes: poForm.notes || null };
    if (editingPO) {
      const { error } = await supabase.from('purchase_orders').update(payload).eq('id', editingPO.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      setPOs(prev => prev.map(p => p.id === editingPO.id ? { ...p, ...payload } as PO : p));
    } else {
      const { data, error } = await supabase.from('purchase_orders').insert(payload).select('*').single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      setPOs(prev => [data as PO, ...prev]);
    }
    toast.success(editingPO ? 'PO updated' : 'PO created');
    setPOModal(false);
    setSaving(false);
  };
  const updateItem = (i: number, field: keyof POItem, val: string | number) => {
    const items = [...poForm.items];
    items[i] = { ...items[i], [field]: val };
    setPOForm(f => ({ ...f, items, total_amount: recalcTotal(items) }));
  };
  const addItem = () => setPOForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, unit_price: 0 }] }));
  const removeItem = (i: number) => setPOForm(f => { const items = f.items.filter((_, idx) => idx !== i); return { ...f, items, total_amount: recalcTotal(items) }; });

  const card = { background: '#0d1220', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 };
  const inp  = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontFamily: sfText, fontSize: 14, padding: '10px 14px', outline: 'none', width: '100%' };
  const lbl  = { fontSize: 12, color: '#5a6070', fontWeight: 600 as const, letterSpacing: '0.05em' as const, textTransform: 'uppercase' as const, display: 'block' as const, marginBottom: 6 };

  return (
    <>
    {dialog}
    <div style={{ background: '#060b18', minHeight: '100vh', padding: '28px 24px', fontFamily: sfText }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: sfDisplay, fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>Suppliers</h1>
          <p style={{ color: '#5a6070', fontSize: 13, margin: '4px 0 0' }}>Manage vendors and purchase orders for raw materials</p>
        </div>
        <button
          onClick={tab === 'suppliers' ? openAddSupplier : openAddPO}
          className="flex items-center gap-2"
          style={{ background: '#c9a46a', color: '#000', border: 'none', borderRadius: 10, padding: '10px 18px', fontFamily: sfText, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={15} /> {tab === 'suppliers' ? 'Add Supplier' : 'New Order'}
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Suppliers', value: suppliers.length, color: '#c9a46a' },
          { label: 'Active Suppliers', value: suppliers.filter(s => s.is_active).length, color: '#22c55e' },
          { label: 'Open Orders', value: pos.filter(p => ['draft','sent','partial'].includes(p.status)).length, color: '#3b82f6' },
          { label: 'Orders Value', value: fmt(pos.filter(p => p.status !== 'cancelled').reduce((s, p) => s + p.total_amount, 0)), color: '#c9a46a' },
        ].map(k => (
          <div key={k.label} style={{ ...card, padding: '18px 20px' }}>
            <p style={{ fontSize: 12, color: '#5a6070', margin: '0 0 8px', letterSpacing: '-0.1px' }}>{k.label}</p>
            <p style={{ fontFamily: sfDisplay, fontSize: 24, fontWeight: 700, color: k.color, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div style={{ ...card, padding: '16px 20px', marginBottom: 20 }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {(['suppliers', 'orders'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? 'rgba(201,164,106,0.1)' : 'transparent', border: `1px solid ${tab === t ? 'rgba(201,164,106,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 8, padding: '7px 16px', cursor: 'pointer', color: tab === t ? '#c9a46a' : '#5a6070', fontFamily: sfText, fontSize: 13, fontWeight: tab === t ? 600 : 400 }}>
                {t === 'suppliers' ? `Suppliers (${suppliers.length})` : `Purchase Orders (${pos.length})`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px' }}>
            <Search size={14} style={{ color: '#5a6070' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ background: 'none', border: 'none', color: '#fff', fontFamily: sfText, fontSize: 13, outline: 'none', flex: 1 }} />
          </div>
          <button onClick={fetchAll} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: '#5a6070' }}><RefreshCw size={14} /></button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: 200 }}>
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#c9a46a', borderTopColor: 'transparent' }} />
        </div>
      ) : tab === 'suppliers' ? (
        /* ── Suppliers grid ── */
        filteredSuppliers.length === 0 ? (
          <div style={{ ...card, padding: 40, textAlign: 'center', color: '#5a6070' }}>
            <Truck size={32} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14 }}>No suppliers yet. Add your first supplier.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSuppliers.map(s => (
              <div key={s.id} style={{ ...card, padding: 22 }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p style={{ fontFamily: sfDisplay, fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>{s.name}</p>
                    {s.contact_name && <p style={{ fontSize: 12, color: '#5a6070', margin: '3px 0 0' }}>{s.contact_name}</p>}
                  </div>
                  <span style={{ background: s.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(90,96,112,0.1)', border: `1px solid ${s.is_active ? 'rgba(34,197,94,0.3)' : 'rgba(90,96,112,0.3)'}`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, color: s.is_active ? '#22c55e' : '#5a6070' }}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {s.email && <div className="flex items-center gap-2"><Mail size={12} style={{ color: '#5a6070' }} /><a href={`mailto:${s.email}`} style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none' }}>{s.email}</a></div>}
                  {s.phone && <div className="flex items-center gap-2"><Phone size={12} style={{ color: '#5a6070' }} /><span style={{ fontSize: 13, color: '#9ca3af' }}>{s.phone}</span></div>}
                  {s.address && <div className="flex items-start gap-2"><MapPin size={12} style={{ color: '#5a6070', marginTop: 2 }} /><span style={{ fontSize: 13, color: '#9ca3af' }}>{s.address}</span></div>}
                  {s.materials && <div className="flex items-start gap-2"><Package size={12} style={{ color: '#c9a46a', marginTop: 2 }} /><span style={{ fontSize: 12, color: '#c9a46a' }}>{s.materials}</span></div>}
                  {s.payment_terms && <div className="flex items-center gap-2"><ClipboardList size={12} style={{ color: '#5a6070' }} /><span style={{ fontSize: 12, color: '#5a6070' }}>{s.payment_terms}</span></div>}
                </div>
                <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button onClick={() => openEditSupplier(s)} className="flex items-center gap-1.5 flex-1 justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px', cursor: 'pointer', color: '#9ca3af', fontSize: 12 }}>
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => deleteSupplier(s.id)} className="flex items-center gap-1.5 flex-1 justify-center" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '7px', cursor: 'pointer', color: '#ef4444', fontSize: 12 }}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* ── Purchase Orders table ── */
        <div style={{ ...card, overflow: 'hidden' }}>
          {filteredPOs.length === 0 ? (
            <div className="flex flex-col items-center justify-center" style={{ height: 200, color: '#5a6070' }}>
              <ClipboardList size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 14 }}>No purchase orders yet.</p>
            </div>
          ) : (
            filteredPOs.map((po, i) => {
              const expanded = expandedPO === po.id;
              return (
                <div key={po.id} style={{ borderBottom: i < filteredPOs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                    style={{ background: expanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                    onClick={() => setExpandedPO(expanded ? null : po.id)}
                  >
                    <div className="flex-1">
                      <p style={{ fontFamily: sfDisplay, fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>
                        {po.suppliers?.name || 'Unknown Supplier'}
                        {po.po_number && <span style={{ fontFamily: sfMono, fontSize: 11, color: '#5a6070', marginLeft: 8 }}>#{po.po_number}</span>}
                      </p>
                      <p style={{ fontSize: 12, color: '#5a6070', margin: '3px 0 0' }}>
                        {new Date(po.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {po.expected_delivery && ` · Expected ${new Date(po.expected_delivery + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </p>
                    </div>
                    <span style={{ background: `${statusColor(po.status)}15`, border: `1px solid ${statusColor(po.status)}35`, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, color: statusColor(po.status) }}>{statusLabel(po.status)}</span>
                    <span style={{ fontFamily: sfMono, fontSize: 14, color: '#c9a46a', fontWeight: 600, minWidth: 90, textAlign: 'right' }}>{fmt(po.total_amount)}</span>
                    <div className="flex gap-1.5">
                      <button onClick={e => { e.stopPropagation(); openEditPO(po); }} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#9ca3af' }}><Edit2 size={12} /></button>
                    </div>
                    {expanded ? <ChevronUp size={16} style={{ color: '#5a6070' }} /> : <ChevronDown size={16} style={{ color: '#5a6070' }} />}
                  </div>
                  {expanded && po.items?.length > 0 && (
                    <div style={{ padding: '0 20px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
                        <thead>
                          <tr>
                            {['Item', 'Qty', 'Unit Price', 'Total'].map(h => (
                              <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontSize: 11, color: '#5a6070', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {po.items.map((item, idx) => (
                            <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '8px 12px', color: '#e0e0e0', fontSize: 13 }}>{item.description}</td>
                              <td style={{ padding: '8px 12px', color: '#9ca3af', fontSize: 13 }}>{item.quantity}</td>
                              <td style={{ padding: '8px 12px', color: '#9ca3af', fontSize: 13, fontFamily: sfMono }}>{fmt(item.unit_price)}</td>
                              <td style={{ padding: '8px 12px', color: '#c9a46a', fontSize: 13, fontFamily: sfMono, fontWeight: 600 }}>{fmt(item.quantity * item.unit_price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {po.notes && <p style={{ fontSize: 12, color: '#5a6070', marginTop: 8, fontStyle: 'italic' }}>{po.notes}</p>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Supplier Modal */}
      {supplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: sfDisplay, fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <button onClick={() => setSupplierModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6070' }}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label style={lbl}>Company Name *</label><input value={sForm.name} onChange={e => setSForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Namibia Timber Co." style={inp} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label style={lbl}>Contact Person</label><input value={sForm.contact_name} onChange={e => setSForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="Full name" style={inp} /></div>
                <div><label style={lbl}>Phone</label><input value={sForm.phone} onChange={e => setSForm(f => ({ ...f, phone: e.target.value }))} placeholder="+264 81 000 0000" style={inp} /></div>
              </div>
              <div><label style={lbl}>Email</label><input type="email" value={sForm.email} onChange={e => setSForm(f => ({ ...f, email: e.target.value }))} placeholder="vendor@example.com" style={inp} /></div>
              <div><label style={lbl}>Address</label><input value={sForm.address} onChange={e => setSForm(f => ({ ...f, address: e.target.value }))} placeholder="Street, City" style={inp} /></div>
              <div><label style={lbl}>Materials Supplied</label><input value={sForm.materials} onChange={e => setSForm(f => ({ ...f, materials: e.target.value }))} placeholder="e.g. Oak, Teak, Fabric, Hardware…" style={inp} /></div>
              <div><label style={lbl}>Payment Terms</label><input value={sForm.payment_terms} onChange={e => setSForm(f => ({ ...f, payment_terms: e.target.value }))} placeholder="e.g. Net 30, COD" style={inp} /></div>
              <div><label style={lbl}>Notes</label><textarea value={sForm.notes} onChange={e => setSForm(f => ({ ...f, notes: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical' }} /></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <div style={{ width: 36, height: 20, background: sForm.is_active ? '#c9a46a' : 'rgba(255,255,255,0.1)', borderRadius: 10, position: 'relative', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => setSForm(f => ({ ...f, is_active: !f.is_active }))}>
                  <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: sForm.is_active ? 18 : 2, transition: 'left 0.2s' }} />
                </div>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>Active supplier</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSupplierModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 11, color: '#9ca3af', fontFamily: sfText, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveSupplier} disabled={saving} style={{ flex: 1, background: '#c9a46a', border: 'none', borderRadius: 10, padding: 11, color: '#000', fontFamily: sfText, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : editingSupplier ? 'Update' : 'Add Supplier'}</button>
            </div>
          </div>
        </div>
      )}

      {/* PO Modal */}
      {poModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 600, maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: sfDisplay, fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>{editingPO ? 'Edit Purchase Order' : 'New Purchase Order'}</h2>
              <button onClick={() => setPOModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6070' }}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={lbl}>Supplier *</label>
                  <SelectField
                    value={poForm.supplier_id}
                    onChange={v => setPOForm(f => ({ ...f, supplier_id: v }))}
                    options={[{ value: '', label: 'Select supplier…' }, ...suppliers.filter(s => s.is_active).map(s => ({ value: s.id, label: s.name }))]}
                    placeholder="Select supplier…"
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>PO Number</label>
                  <input value={poForm.po_number} onChange={e => setPOForm(f => ({ ...f, po_number: e.target.value }))} placeholder="e.g. PO-2026-001" style={inp} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={lbl}>Status</label>
                  <SelectField
                    value={poForm.status}
                    onChange={v => setPOForm(f => ({ ...f, status: v }))}
                    options={PO_STATUSES.map(s => ({ value: s.key, label: s.label }))}
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>Expected Delivery</label>
                  <input type="date" value={poForm.expected_delivery} onChange={e => setPOForm(f => ({ ...f, expected_delivery: e.target.value }))} style={{ ...inp, colorScheme: 'dark' }} />
                </div>
              </div>
              {/* Line items */}
              <div>
                <label style={{ ...lbl, marginBottom: 10 }}>Items</label>
                {poForm.items.map((item, i) => (
                  <div key={i} className="grid gap-2 mb-2" style={{ gridTemplateColumns: '1fr 80px 120px 32px' }}>
                    <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder={`Item ${i + 1} description`} style={{ ...inp, padding: '8px 12px' }} />
                    <input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)} style={{ ...inp, padding: '8px 12px' }} />
                    <input type="number" min={0} step={0.01} value={item.unit_price} onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)} style={{ ...inp, padding: '8px 12px' }} placeholder="Unit price" />
                    {poForm.items.length > 1 && (
                      <button onClick={() => removeItem(i)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} /></button>
                    )}
                  </div>
                ))}
                <button onClick={addItem} className="flex items-center gap-1.5" style={{ background: 'none', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', color: '#5a6070', fontFamily: sfText, fontSize: 12, marginTop: 4 }}>
                  <Plus size={12} /> Add Item
                </button>
                <div className="flex justify-end mt-3">
                  <p style={{ fontFamily: sfMono, fontSize: 16, color: '#c9a46a', fontWeight: 700 }}>Total: {fmt(recalcTotal(poForm.items))}</p>
                </div>
              </div>
              <div><label style={lbl}>Notes</label><textarea value={poForm.notes} onChange={e => setPOForm(f => ({ ...f, notes: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical' }} /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setPOModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 11, color: '#9ca3af', fontFamily: sfText, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={savePO} disabled={saving} style={{ flex: 1, background: '#c9a46a', border: 'none', borderRadius: 10, padding: 11, color: '#000', fontFamily: sfText, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : editingPO ? 'Update PO' : 'Create PO'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};
