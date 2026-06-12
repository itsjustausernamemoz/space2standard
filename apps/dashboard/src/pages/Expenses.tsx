import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import {
  Plus, X, Search, Receipt, TrendingDown,
  Edit2, Trash2, RefreshCw, Filter
} from 'lucide-react';

const sfDisplay = 'SF Pro Display, system-ui, -apple-system, sans-serif';
const sfText    = 'SF Pro Text, system-ui, -apple-system, sans-serif';
const sfMono    = 'SF Mono, ui-monospace, monospace';

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  supplier_id?: string;
  notes?: string;
  created_at: string;
}

interface Supplier { id: string; name: string; }

const CATEGORIES = [
  { key: 'Materials',  color: '#c9a46a' },
  { key: 'Labor',      color: '#3b82f6' },
  { key: 'Utilities',  color: '#06b6d4' },
  { key: 'Transport',  color: '#f97316' },
  { key: 'Marketing',  color: '#a855f7' },
  { key: 'Rent',       color: '#ec4899' },
  { key: 'Equipment',  color: '#22c55e' },
  { key: 'Other',      color: '#5a6070' },
];

const catColor = (c: string) => CATEGORIES.find(x => x.key === c)?.color || '#5a6070';
const fmt = (n: number) => `N$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const thisMonthStart = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

const emptyForm = { category: 'Materials', description: '', amount: '', expense_date: new Date().toISOString().split('T')[0], supplier_id: '', notes: '' };

export const Expenses = () => {
  const [expenses, setExpenses]     = useState<Expense[]>([]);
  const [suppliers, setSuppliers]   = useState<Supplier[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [catFilter, setCatFilter]   = useState('All');
  const [dateFrom, setDateFrom]     = useState(thisMonthStart());
  const [dateTo, setDateTo]         = useState('');
  const [modal, setModal]           = useState(false);
  const [editing, setEditing]       = useState<Expense | null>(null);
  const [form, setForm]             = useState({ ...emptyForm });
  const [saving, setSaving]         = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchAll(); }, [catFilter, dateFrom, dateTo, search]);

  const fetchAll = async () => {
    setLoading(true);
    let q = supabase.from('expenses').select('*');
    if (catFilter !== 'All') q = q.eq('category', catFilter);
    if (dateFrom) q = q.gte('expense_date', dateFrom);
    if (dateTo)   q = q.lte('expense_date', dateTo);
    if (search)   q = q.ilike('description', `%${search}%`);

    const [{ data }, { data: sData }] = await Promise.all([
      q.order('expense_date', { ascending: false }),
      supabase.from('suppliers').select('id, name').eq('is_active', true).order('name'),
    ]);

    setExpenses(data || []);
    setSuppliers(sData || []);
    setLoading(false);
  };

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setModal(true); };
  const openEdit = (e: Expense) => {
    setEditing(e);
    setForm({ category: e.category, description: e.description, amount: String(e.amount), expense_date: e.expense_date, supplier_id: e.supplier_id || '', notes: e.notes || '' });
    setModal(true);
  };
  const saveExpense = async () => {
    if (!form.description.trim()) { toast.error('Description required'); return; }
    if (!form.amount || isNaN(parseFloat(form.amount))) { toast.error('Valid amount required'); return; }
    setSaving(true);
    const payload = { category: form.category, description: form.description.trim(), amount: parseFloat(form.amount), expense_date: form.expense_date, supplier_id: form.supplier_id || null, notes: form.notes.trim() || null };
    const { error } = editing
      ? await supabase.from('expenses').update(payload).eq('id', editing.id)
      : await supabase.from('expenses').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(editing ? 'Expense updated' : 'Expense recorded'); setModal(false); fetchAll(); }
    setSaving(false);
  };
  const deleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Deleted'); fetchAll(); }
  };

  // Computed stats
  const totalShown   = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory   = CATEGORIES.map(c => ({ ...c, total: expenses.filter(e => e.category === c.key).reduce((s, e) => s + e.amount, 0) })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const topCategory  = byCategory[0];

  const card = { background: '#0d1220', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 };
  const inp  = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontFamily: sfText, fontSize: 14, padding: '10px 14px', outline: 'none', width: '100%' };
  const lbl  = { fontSize: 12, color: '#5a6070', fontWeight: 600 as const, letterSpacing: '0.05em' as const, textTransform: 'uppercase' as const, display: 'block' as const, marginBottom: 6 };

  return (
    <div style={{ background: '#060b18', minHeight: '100vh', padding: '28px 24px', fontFamily: sfText }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: sfDisplay, fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>Expenses</h1>
          <p style={{ color: '#5a6070', fontSize: 13, margin: '4px 0 0' }}>Track operational costs and monitor profitability</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2" style={{ background: '#c9a46a', color: '#000', border: 'none', borderRadius: 10, padding: '10px 18px', fontFamily: sfText, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> Record Expense
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div style={{ ...card, padding: '18px 20px', gridColumn: 'span 1' }}>
          <div className="flex items-center gap-2 mb-2"><TrendingDown size={16} style={{ color: '#ef4444' }} /><span style={{ fontSize: 12, color: '#5a6070' }}>Period Total</span></div>
          <p style={{ fontFamily: sfDisplay, fontSize: 24, fontWeight: 700, color: '#ef4444', margin: 0 }}>{fmt(totalShown)}</p>
          <p style={{ fontSize: 11, color: '#3a4050', margin: '4px 0 0' }}>{expenses.length} transaction{expenses.length !== 1 ? 's' : ''}</p>
        </div>
        {byCategory.slice(0, 3).map(c => (
          <div key={c.key} style={{ ...card, padding: '18px 20px' }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#5a6070', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.key}</span>
            </div>
            <p style={{ fontFamily: sfDisplay, fontSize: 22, fontWeight: 700, color: c.color, margin: 0 }}>{fmt(c.total)}</p>
            <div style={{ marginTop: 8, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <div style={{ height: '100%', background: c.color, borderRadius: 2, width: `${totalShown ? Math.round((c.total / totalShown) * 100) : 0}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Category breakdown bar */}
      {byCategory.length > 0 && (
        <div style={{ ...card, padding: '16px 20px', marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: '#5a6070', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Breakdown</p>
          <div className="flex gap-0.5 rounded-lg overflow-hidden mb-3" style={{ height: 8 }}>
            {byCategory.map(c => (
              <div key={c.key} style={{ flex: c.total, background: c.color }} title={`${c.key}: ${fmt(c.total)}`} />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {byCategory.map(c => (
              <div key={c.key} className="flex items-center gap-1.5">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{c.key}</span>
                <span style={{ fontSize: 12, color: '#5a6070', fontFamily: sfMono }}>{fmt(c.total)}</span>
                <span style={{ fontSize: 11, color: '#3a4050' }}>({totalShown ? Math.round((c.total / totalShown) * 100) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ ...card, padding: '16px 20px', marginBottom: 20 }}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px' }}>
            <Search size={14} style={{ color: '#5a6070' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search description…" style={{ background: 'none', border: 'none', color: '#fff', fontFamily: sfText, fontSize: 13, outline: 'none', flex: 1 }} />
          </div>
          <button onClick={() => setShowFilters(f => !f)} className="flex items-center gap-1.5" style={{ background: showFilters ? 'rgba(201,164,106,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${showFilters ? 'rgba(201,164,106,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: showFilters ? '#c9a46a' : '#5a6070', fontFamily: sfText, fontSize: 13 }}>
            <Filter size={13} /> Filters
          </button>
          <button onClick={fetchAll} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: '#5a6070' }}><RefreshCw size={14} /></button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex gap-1 flex-wrap">
              {['All', ...CATEGORIES.map(c => c.key)].map(c => (
                <button key={c} onClick={() => setCatFilter(c)} style={{ background: catFilter === c ? `${catColor(c)}18` : 'transparent', border: `1px solid ${catFilter === c ? `${catColor(c)}50` : 'rgba(255,255,255,0.06)'}`, borderRadius: 7, padding: '4px 11px', cursor: 'pointer', color: catFilter === c ? catColor(c) : '#5a6070', fontFamily: sfText, fontSize: 12, fontWeight: catFilter === c ? 600 : 400 }}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#9ca3af', fontFamily: sfText, fontSize: 12, padding: '6px 10px', outline: 'none', colorScheme: 'dark' }} />
              <span style={{ color: '#5a6070', fontSize: 12 }}>to</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#9ca3af', fontFamily: sfText, fontSize: 12, padding: '6px 10px', outline: 'none', colorScheme: 'dark' }} />
            </div>
          </div>
        )}
      </div>

      {/* Expense list */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: 200 }}>
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#c9a46a', borderTopColor: 'transparent' }} />
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ height: 200, color: '#5a6070' }}>
            <Receipt size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 14 }}>No expenses recorded for this period.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Date', 'Category', 'Description', 'Amount', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontFamily: sfText, fontSize: 11, fontWeight: 600, color: '#5a6070', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, i) => (
                  <tr key={exp.id}
                    style={{ borderBottom: i < expenses.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px', color: '#9ca3af', fontSize: 13, whiteSpace: 'nowrap' }}>
                      {new Date(exp.expense_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: `${catColor(exp.category)}15`, border: `1px solid ${catColor(exp.category)}35`, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, color: catColor(exp.category) }}>{exp.category}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ color: '#e0e0e0', fontSize: 14, margin: 0 }}>{exp.description}</p>
                      {exp.notes && <p style={{ color: '#5a6070', fontSize: 11, margin: '2px 0 0', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.notes}</p>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontFamily: sfMono, fontSize: 14, color: '#ef4444', fontWeight: 600 }}>{fmt(exp.amount)}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(exp)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#9ca3af' }}><Edit2 size={12} /></button>
                        <button onClick={() => deleteExpense(exp.id)} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <td colSpan={3} style={{ padding: '14px 20px', fontFamily: sfText, fontSize: 12, color: '#5a6070', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Total ({expenses.length} items)</td>
                  <td style={{ padding: '14px 20px', fontFamily: sfMono, fontSize: 16, color: '#ef4444', fontWeight: 700 }}>{fmt(totalShown)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: sfDisplay, fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>{editing ? 'Edit Expense' : 'Record Expense'}</h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6070' }}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label style={lbl}>Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => (
                    <button key={c.key} onClick={() => setForm(f => ({ ...f, category: c.key }))} style={{ background: form.category === c.key ? `${c.color}18` : 'transparent', border: `1px solid ${form.category === c.key ? `${c.color}50` : 'rgba(255,255,255,0.08)'}`, borderRadius: 7, padding: '5px 12px', cursor: 'pointer', color: form.category === c.key ? c.color : '#5a6070', fontFamily: sfText, fontSize: 12, fontWeight: form.category === c.key ? 600 : 400 }}>{c.key}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl}>Description *</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Oak wood planks, 12 units" style={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={lbl}>Amount (N$) *</label>
                  <input type="number" min={0} step={0.01} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Date</label>
                  <input type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} style={{ ...inp, colorScheme: 'dark' }} />
                </div>
              </div>
              {suppliers.length > 0 && (
                <div>
                  <label style={lbl}>Supplier (optional)</label>
                  <select value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="">None</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label style={lbl}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Additional details…" style={{ ...inp, resize: 'vertical' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 11, color: '#9ca3af', fontFamily: sfText, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveExpense} disabled={saving} style={{ flex: 1, background: '#c9a46a', border: 'none', borderRadius: 10, padding: 11, color: '#000', fontFamily: sfText, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : editing ? 'Update' : 'Record Expense'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
