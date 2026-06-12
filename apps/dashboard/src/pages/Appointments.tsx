import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { SelectField } from '@/components/SelectField';
import { useConfirm } from '@/components/ConfirmDialog';
import {
  Plus, X, Search, CalendarDays, Clock,
  Edit2, Trash2, RefreshCw, Phone, Mail,
  CheckCircle2, XCircle, AlertCircle, MapPin
} from 'lucide-react';

const sfDisplay = 'SF Pro Display, system-ui, -apple-system, sans-serif';
const sfText    = 'SF Pro Text, system-ui, -apple-system, sans-serif';

interface Appointment {
  id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  type: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  notes?: string;
  order_id?: string;
  created_at: string;
}

const TYPES = [
  { key: 'consultation', label: 'Consultation', color: '#3b82f6',  icon: '💬' },
  { key: 'site_visit',   label: 'Site Visit',   color: '#f97316',  icon: '📍' },
  { key: 'delivery',     label: 'Delivery',     color: '#22c55e',  icon: '🚚' },
  { key: 'showroom',     label: 'Showroom',     color: '#a855f7',  icon: '🪑' },
  { key: 'follow_up',   label: 'Follow-up',   color: '#c9a46a',  icon: '📞' },
];

const STATUSES = [
  { key: 'scheduled',  label: 'Scheduled',  color: '#3b82f6' },
  { key: 'confirmed',  label: 'Confirmed',  color: '#22c55e' },
  { key: 'completed',  label: 'Completed',  color: '#c9a46a' },
  { key: 'cancelled',  label: 'Cancelled',  color: '#ef4444' },
  { key: 'no_show',    label: 'No Show',    color: '#f97316' },
];

const typeLabel  = (t: string) => TYPES.find(x => x.key === t)?.label   || t;
const typeColor  = (t: string) => TYPES.find(x => x.key === t)?.color   || '#5a6070';
const typeIcon   = (t: string) => TYPES.find(x => x.key === t)?.icon    || '📅';
const statLabel  = (s: string) => STATUSES.find(x => x.key === s)?.label || s;
const statColor  = (s: string) => STATUSES.find(x => x.key === s)?.color || '#5a6070';

const todayStr = () => new Date().toISOString().split('T')[0];
const fmtDate  = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const fmtTime  = (t: string) => {
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const empty = { client_name: '', client_email: '', client_phone: '', type: 'consultation', appointment_date: todayStr(), appointment_time: '09:00', duration_minutes: 60, status: 'scheduled', notes: '', order_id: '' };

export const Appointments = () => {
  const { confirm, dialog } = useConfirm();
  const [appts, setAppts]         = useState<Appointment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('upcoming');
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState<Appointment | null>(null);
  const [form, setForm]           = useState({ ...empty });
  const [saving, setSaving]       = useState(false);

  useEffect(() => { fetchAppts(); }, [statusFilter, search]);

  const fetchAppts = async () => {
    setLoading(true);
    let q = supabase.from('appointments').select('*');
    const today = todayStr();
    if (statusFilter === 'upcoming') {
      q = q.gte('appointment_date', today).in('status', ['scheduled', 'confirmed']);
    } else if (statusFilter === 'today') {
      q = q.eq('appointment_date', today);
    } else if (statusFilter !== 'all') {
      q = q.eq('status', statusFilter);
    }
    if (search) q = q.ilike('client_name', `%${search}%`);
    const { data, error } = await q.order('appointment_date').order('appointment_time');
    if (error) toast.error('Failed to load appointments');
    setAppts(data || []);
    setLoading(false);
  };

  const openAdd = () => { setEditing(null); setForm({ ...empty, appointment_date: todayStr() }); setModal(true); };
  const openEdit = (a: Appointment) => {
    setEditing(a);
    setForm({ client_name: a.client_name, client_email: a.client_email || '', client_phone: a.client_phone || '', type: a.type, appointment_date: a.appointment_date, appointment_time: a.appointment_time.slice(0, 5), duration_minutes: a.duration_minutes, status: a.status, notes: a.notes || '', order_id: a.order_id || '' });
    setModal(true);
  };

  const save = async () => {
    if (!form.client_name.trim()) { toast.error('Client name required'); return; }
    if (!form.appointment_date)   { toast.error('Date required'); return; }
    setSaving(true);
    const payload = { client_name: form.client_name.trim(), client_email: form.client_email || null, client_phone: form.client_phone || null, type: form.type, appointment_date: form.appointment_date, appointment_time: form.appointment_time, duration_minutes: form.duration_minutes, status: form.status, notes: form.notes.trim() || null, order_id: form.order_id || null };
    if (editing) {
      const { error } = await supabase.from('appointments').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      setAppts(prev => prev.map(a => a.id === editing.id ? { ...a, ...payload } as Appointment : a));
    } else {
      const { data, error } = await supabase.from('appointments').insert(payload).select('*').single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      setAppts(prev => ([...prev, data as Appointment]).sort((a, b) => a.appointment_date.localeCompare(b.appointment_date) || a.appointment_time.localeCompare(b.appointment_time)));
    }
    toast.success(editing ? 'Appointment updated' : 'Appointment created');
    setModal(false);
    setSaving(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    toast.success(`Marked as ${statLabel(status)}`);
  };

  const deleteAppt = async (id: string) => {
    if (!await confirm({ title: 'Delete Appointment', message: 'This appointment will be permanently removed from the schedule.', danger: true })) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    setAppts(prev => prev.filter(a => a.id !== id));
    toast.success('Deleted');
  };

  const today      = todayStr();
  const todayAppts = appts.filter(a => a.appointment_date === today);
  const upcoming   = appts.filter(a => a.appointment_date > today && ['scheduled','confirmed'].includes(a.status));
  const totalThisWeek = (() => {
    const now = new Date(); const day = now.getDay();
    const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return appts.filter(a => { const d = new Date(a.appointment_date + 'T00:00:00'); return d >= mon && d <= sun; }).length;
  })();

  const grouped: Record<string, Appointment[]> = {};
  appts.forEach(a => { if (!grouped[a.appointment_date]) grouped[a.appointment_date] = []; grouped[a.appointment_date].push(a); });

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
          <h1 style={{ fontFamily: sfDisplay, fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px', margin: 0 }}>Appointments</h1>
          <p style={{ color: '#5a6070', fontSize: 13, margin: '4px 0 0' }}>Manage client consultations, site visits, and deliveries</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2" style={{ background: '#c9a46a', color: '#000', border: 'none', borderRadius: 10, padding: '10px 18px', fontFamily: sfText, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={15} /> New Appointment
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Today's Appointments", value: todayAppts.length,  color: '#c9a46a', icon: <CalendarDays size={16} /> },
          { label: 'This Week',            value: totalThisWeek,      color: '#3b82f6', icon: <Clock size={16} /> },
          { label: 'Upcoming',             value: upcoming.length,    color: '#22c55e', icon: <CheckCircle2 size={16} /> },
          { label: 'Total Shown',          value: appts.length,       color: '#5a6070', icon: <CalendarDays size={16} /> },
        ].map(k => (
          <div key={k.label} style={{ ...card, padding: '18px 20px' }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: k.color }}>{k.icon}<span style={{ fontSize: 12, color: '#5a6070' }}>{k.label}</span></div>
            <p style={{ fontFamily: sfDisplay, fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ ...card, padding: '16px 20px', marginBottom: 20 }}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {[
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'today',    label: 'Today' },
              { key: 'all',      label: 'All' },
              ...STATUSES.map(s => ({ key: s.key, label: s.label })),
            ].map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{ background: statusFilter === f.key ? 'rgba(201,164,106,0.1)' : 'transparent', border: `1px solid ${statusFilter === f.key ? 'rgba(201,164,106,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 7, padding: '5px 12px', cursor: 'pointer', color: statusFilter === f.key ? '#c9a46a' : '#5a6070', fontFamily: sfText, fontSize: 12, fontWeight: statusFilter === f.key ? 600 : 400 }}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px' }}>
            <Search size={14} style={{ color: '#5a6070' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client name…" style={{ background: 'none', border: 'none', color: '#fff', fontFamily: sfText, fontSize: 13, outline: 'none', flex: 1 }} />
          </div>
          <button onClick={fetchAppts} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: '#5a6070' }}><RefreshCw size={14} /></button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: 200 }}>
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#c9a46a', borderTopColor: 'transparent' }} />
        </div>
      ) : appts.length === 0 ? (
        <div style={{ ...card, padding: 40, textAlign: 'center', color: '#5a6070' }}>
          <CalendarDays size={32} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14 }}>No appointments for this filter.</p>
        </div>
      ) : (
        /* Grouped by date */
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, dayAppts]) => {
            const isToday = date === today;
            return (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.06)' }} />
                  <span style={{ fontFamily: sfDisplay, fontSize: 13, fontWeight: 600, color: isToday ? '#c9a46a' : '#5a6070', background: isToday ? 'rgba(201,164,106,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isToday ? 'rgba(201,164,106,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 20, padding: '3px 12px', whiteSpace: 'nowrap' }}>
                    {isToday ? '📅 Today' : fmtDate(date)}
                  </span>
                  <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>
                <div className="space-y-3">
                  {dayAppts.map(a => (
                    <div key={a.id} style={{ ...card, padding: '18px 22px' }}>
                      <div className="flex items-start gap-4">
                        {/* Time column */}
                        <div style={{ minWidth: 70, textAlign: 'center', paddingTop: 2 }}>
                          <p style={{ fontFamily: sfDisplay, fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>{fmtTime(a.appointment_time)}</p>
                          <p style={{ fontSize: 11, color: '#5a6070', margin: '2px 0 0' }}>{a.duration_minutes}min</p>
                        </div>
                        {/* Type indicator */}
                        <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, background: typeColor(a.type), flexShrink: 0 }} />
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span style={{ fontSize: 16 }}>{typeIcon(a.type)}</span>
                            <p style={{ fontFamily: sfDisplay, fontSize: 15, fontWeight: 600, color: '#fff', margin: 0 }}>{a.client_name}</p>
                            <span style={{ background: `${typeColor(a.type)}15`, border: `1px solid ${typeColor(a.type)}35`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, color: typeColor(a.type) }}>{typeLabel(a.type)}</span>
                            <span style={{ background: `${statColor(a.status)}15`, border: `1px solid ${statColor(a.status)}35`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, color: statColor(a.status) }}>{statLabel(a.status)}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {a.client_phone && <div className="flex items-center gap-1"><Phone size={11} style={{ color: '#5a6070' }} /><a href={`tel:${a.client_phone}`} style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>{a.client_phone}</a></div>}
                            {a.client_email && <div className="flex items-center gap-1"><Mail size={11} style={{ color: '#5a6070' }} /><a href={`mailto:${a.client_email}`} style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>{a.client_email}</a></div>}
                          </div>
                          {a.notes && <p style={{ fontSize: 12, color: '#5a6070', margin: '6px 0 0', fontStyle: 'italic' }}>{a.notes}</p>}
                        </div>
                        {/* Actions */}
                        <div className="flex flex-col gap-1.5">
                          {a.status === 'scheduled' && (
                            <button onClick={() => updateStatus(a.id, 'confirmed')} className="flex items-center gap-1" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', color: '#22c55e', fontSize: 11, fontWeight: 600 }}>
                              <CheckCircle2 size={11} /> Confirm
                            </button>
                          )}
                          {['scheduled','confirmed'].includes(a.status) && (
                            <button onClick={() => updateStatus(a.id, 'completed')} className="flex items-center gap-1" style={{ background: 'rgba(201,164,106,0.08)', border: '1px solid rgba(201,164,106,0.2)', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', color: '#c9a46a', fontSize: 11, fontWeight: 600 }}>
                              <CheckCircle2 size={11} /> Done
                            </button>
                          )}
                          {['scheduled','confirmed'].includes(a.status) && (
                            <button onClick={() => updateStatus(a.id, 'cancelled')} className="flex items-center gap-1" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', color: '#ef4444', fontSize: 11, fontWeight: 600 }}>
                              <XCircle size={11} /> Cancel
                            </button>
                          )}
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(a)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#9ca3af' }}><Edit2 size={12} /></button>
                            <button onClick={() => deleteAppt(a.id)} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: sfDisplay, fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>{editing ? 'Edit Appointment' : 'New Appointment'}</h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a6070' }}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label style={lbl}>Client Name *</label>
                <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Full name" style={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={lbl}>Phone</label>
                  <input value={form.client_phone} onChange={e => setForm(f => ({ ...f, client_phone: e.target.value }))} placeholder="+264 81 000 0000" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Email</label>
                  <input type="email" value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))} placeholder="client@example.com" style={inp} />
                </div>
              </div>
              <div>
                <label style={lbl}>Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {TYPES.map(t => (
                    <button key={t.key} onClick={() => setForm(f => ({ ...f, type: t.key }))} style={{ background: form.type === t.key ? `${t.color}18` : 'transparent', border: `1px solid ${form.type === t.key ? `${t.color}50` : 'rgba(255,255,255,0.08)'}`, borderRadius: 7, padding: '6px 12px', cursor: 'pointer', color: form.type === t.key ? t.color : '#5a6070', fontFamily: sfText, fontSize: 12, fontWeight: form.type === t.key ? 600 : 400 }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={lbl}>Date *</label>
                  <input type="date" value={form.appointment_date} onChange={e => setForm(f => ({ ...f, appointment_date: e.target.value }))} style={{ ...inp, colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={lbl}>Time</label>
                  <input type="time" value={form.appointment_time} onChange={e => setForm(f => ({ ...f, appointment_time: e.target.value }))} style={{ ...inp, colorScheme: 'dark' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={lbl}>Duration (minutes)</label>
                  <SelectField
                    value={String(form.duration_minutes)}
                    onChange={v => setForm(f => ({ ...f, duration_minutes: parseInt(v) }))}
                    options={[30, 45, 60, 90, 120, 180, 240].map(d => ({ value: String(d), label: d >= 60 ? `${d / 60}h${d % 60 ? ` ${d % 60}min` : ''}` : `${d}min` }))}
                    style={inp}
                  />
                </div>
                <div>
                  <label style={lbl}>Status</label>
                  <SelectField
                    value={form.status}
                    onChange={v => setForm(f => ({ ...f, status: v }))}
                    options={STATUSES.map(s => ({ value: s.key, label: s.label }))}
                    style={inp}
                  />
                </div>
              </div>
              <div>
                <label style={lbl}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Location, agenda, special instructions…" style={{ ...inp, resize: 'vertical' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 11, color: '#9ca3af', fontFamily: sfText, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ flex: 1, background: '#c9a46a', border: 'none', borderRadius: 10, padding: 11, color: '#000', fontFamily: sfText, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : editing ? 'Update' : 'Book Appointment'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};
