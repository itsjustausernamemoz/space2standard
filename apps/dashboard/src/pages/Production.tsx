import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { SelectField } from '@/components/SelectField';
import {
  Plus, X, ChevronRight, Search, Hammer,
  AlertTriangle, Clock, CheckCircle2, Truck,
  Edit2, Trash2, RefreshCw
} from 'lucide-react';

const sfDisplay = 'SF Pro Display, system-ui, -apple-system, sans-serif';
const sfText    = 'SF Pro Text, system-ui, -apple-system, sans-serif';
const sfMono    = 'SF Mono, ui-monospace, monospace';

interface Job {
  id: string;
  order_id?: string;
  product_name: string;
  client_name?: string;
  stage: string;
  priority: string;
  assigned_to?: string;
  quantity: number;
  due_date?: string;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

const STAGES = [
  { key: 'all',       label: 'All Jobs',   color: '#5a6070' },
  { key: 'queued',    label: 'Queued',     color: '#6b7280' },
  { key: 'materials', label: 'Materials',  color: '#3b82f6' },
  { key: 'cutting',   label: 'Cutting',    color: '#f97316' },
  { key: 'assembly',  label: 'Assembly',   color: '#a855f7' },
  { key: 'finishing', label: 'Finishing',  color: '#eab308' },
  { key: 'qc',        label: 'QC',         color: '#06b6d4' },
  { key: 'ready',     label: 'Ready',      color: '#22c55e' },
  { key: 'delivered', label: 'Delivered',  color: '#c9a46a' },
];

const PRIORITIES = [
  { key: 'low',    label: 'Low',    color: '#5a6070' },
  { key: 'normal', label: 'Normal', color: '#3b82f6' },
  { key: 'high',   label: 'High',   color: '#f97316' },
  { key: 'urgent', label: 'Urgent', color: '#ef4444' },
];

const NEXT_STAGE: Record<string, string> = {
  queued:    'materials',
  materials: 'cutting',
  cutting:   'assembly',
  assembly:  'finishing',
  finishing: 'qc',
  qc:        'ready',
  ready:     'delivered',
};

const stageColor  = (s: string) => STAGES.find(x => x.key === s)?.color  || '#5a6070';
const stageLabel  = (s: string) => STAGES.find(x => x.key === s)?.label  || s;
const priColor    = (p: string) => PRIORITIES.find(x => x.key === p)?.color || '#5a6070';
const priLabel    = (p: string) => PRIORITIES.find(x => x.key === p)?.label || p;

const empty: Omit<Job, 'id' | 'created_at'> = {
  product_name: '', client_name: '', stage: 'queued', priority: 'normal',
  assigned_to: '', quantity: 1, due_date: '', notes: '',
};

export const Production = () => {
  const [jobs, setJobs]           = useState<Job[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeStage, setActiveStage] = useState('all');
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState<Job | null>(null);
  const [form, setForm]           = useState({ ...empty });
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);

  useEffect(() => { fetchJobs(); }, [activeStage, search]);

  const fetchJobs = async () => {
    setLoading(true);
    let q = supabase.from('production_jobs').select('*');
    if (activeStage !== 'all') q = q.eq('stage', activeStage);
    if (search) q = q.or(`product_name.ilike.%${search}%,client_name.ilike.%${search}%,assigned_to.ilike.%${search}%`);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) toast.error('Failed to load production jobs');
    setJobs(data || []);
    setLoading(false);
  };

  const openAdd = () => { setEditing(null); setForm({ ...empty }); setModal(true); };
  const openEdit = (j: Job) => {
    setEditing(j);
    setForm({
      product_name: j.product_name, client_name: j.client_name || '',
      stage: j.stage, priority: j.priority, assigned_to: j.assigned_to || '',
      quantity: j.quantity, due_date: j.due_date || '', notes: j.notes || '',
    });
    setModal(true);
  };

  const saveJob = async () => {
    if (!form.product_name.trim()) { toast.error('Product name required'); return; }
    setSaving(true);
    const payload = {
      product_name: form.product_name.trim(),
      client_name:  (form.client_name || '').trim() || null,
      stage:        form.stage,
      priority:     form.priority,
      assigned_to:  (form.assigned_to || '').trim() || null,
      quantity:     form.quantity,
      due_date:     form.due_date || null,
      notes:        (form.notes || '').trim() || null,
      updated_at:   new Date().toISOString(),
      ...(form.stage !== 'queued' && !editing?.started_at ? { started_at: new Date().toISOString() } : {}),
      ...(form.stage === 'delivered' ? { completed_at: new Date().toISOString() } : {}),
    };
    const { error } = editing
      ? await supabase.from('production_jobs').update(payload).eq('id', editing.id)
      : await supabase.from('production_jobs').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(editing ? 'Job updated' : 'Job created'); setModal(false); fetchJobs(); }
    setSaving(false);
  };

  const advanceStage = async (job: Job) => {
    const next = NEXT_STAGE[job.stage];
    if (!next) return;
    const payload: Record<string, any> = { stage: next, updated_at: new Date().toISOString() };
    if (job.stage === 'queued') payload.started_at = new Date().toISOString();
    if (next === 'delivered')   payload.completed_at = new Date().toISOString();
    const { error } = await supabase.from('production_jobs').update(payload).eq('id', job.id);
    if (error) toast.error(error.message);
    else { toast.success(`Moved to ${stageLabel(next)}`); fetchJobs(); }
  };

  const deleteJob = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from('production_jobs').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Job deleted'); fetchJobs(); }
    setDeleting(null);
  };

  const stageCounts = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.stage] = (acc[j.stage] || 0) + 1;
    return acc;
  }, {});
  const activeJobs    = jobs.filter(j => j.stage !== 'delivered').length;
  const urgentJobs    = jobs.filter(j => j.priority === 'urgent').length;
  const readyJobs     = jobs.filter(j => j.stage === 'ready').length;

  const card = {
    background: '#0d1220',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16,
  };

  const inp = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: '#fff',
    fontFamily: sfText,
    fontSize: 14,
    padding: '10px 14px',
    outline: 'none',
    width: '100%',
  };

  return (
    <div style={{ background: '#060b18', minHeight: '100vh', padding: '28px 24px', fontFamily: sfText }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: sfDisplay, fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>
            Production Queue
          </h1>
          <p style={{ color: '#5a6070', fontSize: 13, margin: '4px 0 0', letterSpacing: '-0.1px' }}>
            Track manufacturing jobs from materials to delivery
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2"
          style={{ background: '#c9a46a', color: '#000', border: 'none', borderRadius: 10, padding: '10px 18px', fontFamily: sfText, fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.1px' }}
        >
          <Plus size={15} /> New Job
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Active Jobs',    value: activeJobs,  icon: <Hammer size={16} />,       color: '#c9a46a' },
          { label: 'Urgent',         value: urgentJobs,  icon: <AlertTriangle size={16} />, color: '#ef4444' },
          { label: 'Ready to Ship',  value: readyJobs,   icon: <CheckCircle2 size={16} />,  color: '#22c55e' },
          { label: 'Total Jobs',     value: jobs.length, icon: <Clock size={16} />,         color: '#3b82f6' },
        ].map(k => (
          <div key={k.label} style={{ ...card, padding: '18px 20px' }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: k.color }}>
              {k.icon}
              <span style={{ fontSize: 12, letterSpacing: '-0.1px', opacity: 0.7 }}>{k.label}</span>
            </div>
            <p style={{ fontFamily: sfDisplay, fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Stage tabs + search */}
      <div style={{ ...card, padding: '16px 20px', marginBottom: 20 }}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px' }}>
            <Search size={14} style={{ color: '#5a6070' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search product, client, assignee…"
              style={{ background: 'none', border: 'none', color: '#fff', fontFamily: sfText, fontSize: 13, outline: 'none', flex: 1 }}
            />
          </div>
          <button onClick={fetchJobs} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: '#5a6070' }}>
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {STAGES.map(s => {
            const cnt = s.key === 'all' ? jobs.length : (stageCounts[s.key] || 0);
            const active = activeStage === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActiveStage(s.key)}
                style={{
                  background: active ? `${s.color}18` : 'transparent',
                  border: `1px solid ${active ? s.color + '50' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 8,
                  padding: '5px 12px',
                  cursor: 'pointer',
                  color: active ? s.color : '#5a6070',
                  fontFamily: sfText,
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: '-0.1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {s.label}
                {cnt > 0 && (
                  <span style={{ background: active ? s.color : 'rgba(255,255,255,0.08)', color: active ? '#000' : '#5a6070', borderRadius: 20, padding: '0 6px', fontSize: 10, fontWeight: 700 }}>
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: 200 }}>
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#c9a46a', borderTopColor: 'transparent' }} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ height: 200, color: '#5a6070' }}>
            <Hammer size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 14 }}>No production jobs found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Product', 'Client', 'Qty', 'Stage', 'Priority', 'Assigned To', 'Due', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontFamily: sfText, fontSize: 11, fontWeight: 600, color: '#5a6070', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, i) => {
                  const isLast = i === jobs.length - 1;
                  const overdue = job.due_date && new Date(job.due_date) < new Date() && job.stage !== 'delivered';
                  return (
                    <tr key={job.id} style={{ borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ color: '#fff', fontSize: 14, margin: 0, fontWeight: 500 }}>{job.product_name}</p>
                        {job.notes && <p style={{ color: '#5a6070', fontSize: 11, margin: '2px 0 0', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.notes}</p>}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#9ca3af', fontSize: 13 }}>{job.client_name || '—'}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontFamily: sfMono, fontSize: 13, color: '#c9a46a' }}>{job.quantity}</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ background: `${stageColor(job.stage)}18`, border: `1px solid ${stageColor(job.stage)}40`, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, color: stageColor(job.stage) }}>
                          {stageLabel(job.stage)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ background: `${priColor(job.priority)}15`, border: `1px solid ${priColor(job.priority)}35`, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, color: priColor(job.priority) }}>
                          {priLabel(job.priority)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#9ca3af', fontSize: 13 }}>{job.assigned_to || '—'}</td>
                      <td style={{ padding: '14px 20px' }}>
                        {job.due_date ? (
                          <span style={{ color: overdue ? '#ef4444' : '#9ca3af', fontSize: 13, fontWeight: overdue ? 600 : 400 }}>
                            {overdue && <AlertTriangle size={12} style={{ display: 'inline', marginRight: 4 }} />}
                            {new Date(job.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        ) : <span style={{ color: '#3a4050' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div className="flex items-center gap-1.5">
                          {NEXT_STAGE[job.stage] && (
                            <button
                              onClick={() => advanceStage(job)}
                              title={`Advance to ${stageLabel(NEXT_STAGE[job.stage])}`}
                              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}
                            >
                              <ChevronRight size={12} /> {stageLabel(NEXT_STAGE[job.stage])}
                            </button>
                          )}
                          <button onClick={() => openEdit(job)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#9ca3af' }}>
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => deleteJob(job.id)}
                            disabled={deleting === job.id}
                            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#ef4444' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: sfDisplay, fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>
                {editing ? 'Edit Job' : 'New Production Job'}
              </h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6070' }}><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label style={{ fontSize: 12, color: '#5a6070', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Product Name *</label>
                <input value={form.product_name} onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))} placeholder="e.g. Oak Dining Table" style={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: 12, color: '#5a6070', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Client</label>
                  <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Client name" style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#5a6070', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Quantity</label>
                  <input type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} style={inp} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: 12, color: '#5a6070', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Stage</label>
                  <SelectField
                    value={form.stage}
                    onChange={v => setForm(f => ({ ...f, stage: v }))}
                    options={STAGES.filter(s => s.key !== 'all').map(s => ({ value: s.key, label: s.label }))}
                    style={inp}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#5a6070', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Priority</label>
                  <SelectField
                    value={form.priority}
                    onChange={v => setForm(f => ({ ...f, priority: v }))}
                    options={PRIORITIES.map(p => ({ value: p.key, label: p.label }))}
                    style={inp}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: 12, color: '#5a6070', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Assigned To</label>
                  <input value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} placeholder="Worker name" style={inp} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#5a6070', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} style={{ ...inp, colorScheme: 'dark' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#5a6070', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Special instructions, materials required…" style={{ ...inp, resize: 'vertical' }} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px', color: '#9ca3af', fontFamily: sfText, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={saveJob} disabled={saving} style={{ flex: 1, background: '#c9a46a', border: 'none', borderRadius: 10, padding: '11px', color: '#000', fontFamily: sfText, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : editing ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
