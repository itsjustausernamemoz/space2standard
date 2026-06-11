import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Mail, Search, User, Reply, Trash2, X,
  FileText, UserCircle, Inbox, Send as SendIcon,
  Archive, Plus, Flag, RotateCcw, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

// ── Typography constants ─────────────────────────────────────────────────────
const sfDisplay = 'SF Pro Display, system-ui, -apple-system, sans-serif';
const sfText    = 'SF Pro Text, system-ui, -apple-system, sans-serif';

// ── Helpers ──────────────────────────────────────────────────────────────────
function dateLabel(iso: string) {
  const d = new Date(iso);
  if (isToday(d))     return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'dd MMM');
}

type Folder = 'inbox' | 'sent' | 'trash';

export const Messages = () => {
  const [inquiries,     setInquiries]     = useState<any[]>([]);
  const [selected,      setSelected]      = useState<any>(null);
  const [thread,        setThread]        = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [replyText,     setReplyText]     = useState('');
  const [sending,       setSending]       = useState(false);
  const [search,        setSearch]        = useState('');
  const [adminProfile,  setAdminProfile]  = useState<any>(null);
  const [folder,        setFolder]        = useState<Folder>('inbox');
  const [compose,       setCompose]       = useState(false);
  const [composeTo,     setComposeTo]     = useState('');
  const [composeSub,    setComposeSub]    = useState('');
  const [composeBody,   setComposeBody]   = useState('');
  const [clients,       setClients]       = useState<any[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const replyRef  = useRef<HTMLTextAreaElement>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchMessages();
    fetchAdmin();
    fetchClients();

    const channel = supabase
      .channel('messages_rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'communication_logs' }, () => {
        fetchMessages();
        if (selected) loadThread(selected);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, fetchMessages)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [folder]);

  useEffect(() => {
    if (selected) loadThread(selected);
    else setThread([]);
  }, [selected]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread]);

  async function fetchAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setAdminProfile(data);
    }
  }

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('full_name, email').limit(30);
    setClients(data || []);
  }

  async function fetchMessages() {
    setLoading(true);

    if (folder === 'inbox') {
      const [{ data: cm }, { data: il }] = await Promise.all([
        supabase.from('contact_messages')
          .select('*')
          .or('status.is.null,status.not.in.("archived","deleted")')
          .order('created_at', { ascending: false }),
        supabase.from('communication_logs')
          .select('*')
          .eq('type', 'inbound')
          .or('status.is.null,status.not.in.("archived","deleted")')
          .order('created_at', { ascending: false }),
      ]);

      const unified = [
        ...(cm || []).map((m: any) => ({ ...m, source: 'storefront' })),
        ...(il || []).map((l: any) => ({
          id: l.id, name: l.sender_name, email: l.sender_email,
          subject: l.subject, message: l.body, created_at: l.created_at,
          status: l.status || 'unread', is_flagged: l.is_flagged,
          source: 'email', isLog: true,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setInquiries(unified);
    } else if (folder === 'sent') {
      const { data } = await supabase.from('communication_logs')
        .select('*').eq('type', 'outbound').is('parent_id', null)
        .order('created_at', { ascending: false });

      setInquiries((data || []).map((d: any) => ({
        id: d.id, name: d.recipient_email.split('@')[0], email: d.recipient_email,
        subject: d.subject, message: d.body, created_at: d.created_at,
        status: 'sent', is_flagged: d.is_flagged, isLog: true,
      })));
    } else {
      const [{ data: cm }, { data: cl }] = await Promise.all([
        supabase.from('contact_messages').select('*').eq('status', 'deleted'),
        supabase.from('communication_logs').select('*').eq('status', 'deleted'),
      ]);
      const unified = [
        ...(cm || []).map((m: any) => ({ ...m, source: 'storefront' })),
        ...(cl || []).map((l: any) => ({
          id: l.id, name: l.sender_name, email: l.sender_email,
          subject: l.subject, message: l.body, created_at: l.created_at,
          status: l.status, is_flagged: l.is_flagged, isLog: true,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setInquiries(unified);
    }

    setLoading(false);
  }

  async function loadThread(msg: any) {
    const { data } = await supabase
      .from('communication_logs')
      .select('*')
      .or(`recipient_email.eq.${msg.email},sender_email.eq.${msg.email}`)
      .order('created_at', { ascending: true });
    if (data) setThread(data);
  }

  const updateMsg = async (updates: any) => {
    if (!selected) return;
    const table = selected.isLog ? 'communication_logs' : 'contact_messages';
    const { error } = await supabase.from(table).update(updates).eq('id', selected.id);
    if (error) { toast.error(error.message); return; }
    setSelected({ ...selected, ...updates });
    fetchMessages();
  };

  const sendReply = async (manual = false) => {
    const to      = manual ? composeTo  : selected?.email;
    const subject = manual ? composeSub : `Re: ${selected?.subject || 'Your Inquiry'}`;
    const body    = manual ? composeBody : replyText;
    const name    = manual ? (clients.find(c => c.email === to)?.full_name || to) : selected?.name;
    if (!to || !body.trim()) return;

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ to, recipientName: name, subject, message: body, adminName: adminProfile?.full_name || 'Admin' }),
      });
      if (!res.ok) throw new Error('Send failed');

      await supabase.from('communication_logs').insert({
        type: 'outbound',
        sender_name: adminProfile?.full_name || 'Admin',
        sender_email: 'studio@space2standard.com',
        recipient_email: to, subject, body,
        admin_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (!manual && !selected?.isLog) {
        await supabase.from('contact_messages').update({ status: 'replied' }).eq('id', selected.id);
      }

      toast.success('Message sent.');
      if (manual) { setCompose(false); setComposeTo(''); setComposeSub(''); setComposeBody(''); }
      else setReplyText('');
      fetchMessages();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const filtered = inquiries.filter(m =>
    `${m.name} ${m.subject} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  );

  // ── Folders ────────────────────────────────────────────────────────────────
  const folders = [
    { id: 'inbox' as Folder, label: 'Inbox',  icon: Inbox    },
    { id: 'sent'  as Folder, label: 'Sent',   icon: SendIcon },
    { id: 'trash' as Folder, label: 'Trash',  icon: Trash2   },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-x-4 lg:inset-x-8 top-28 bottom-6 flex overflow-hidden"
      style={{ background: 'rgba(6,11,24,0.6)', backdropFilter: 'blur(40px) saturate(180%)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)' }}
    >

      {/* ── Col 1: Folder sidebar (220px) ──────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col shrink-0 py-6 px-4 gap-1 border-r"
        style={{ width: 220, borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {/* Compose button — pill */}
        <button
          onClick={() => setCompose(true)}
          className="flex items-center gap-2 mb-4 active:scale-95 transition-transform"
          style={{ background: '#c9a46a', borderRadius: 9999, padding: '10px 18px', border: 'none', cursor: 'pointer', fontFamily: sfText, fontSize: 14, fontWeight: 400, color: '#060b18', letterSpacing: '-0.224px' }}
        >
          <Plus size={16} />
          New Message
        </button>

        {/* Folder list */}
        {folders.map(f => (
          <button
            key={f.id}
            onClick={() => { setFolder(f.id); setSelected(null); }}
            className="flex items-center gap-3 transition-colors text-left"
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: folder === f.id ? 'rgba(201,164,106,0.12)' : 'transparent',
              fontFamily: sfText,
              fontSize: 14,
              fontWeight: 400,
              letterSpacing: '-0.224px',
              color: folder === f.id ? '#c9a46a' : '#6a7080',
            }}
          >
            <f.icon size={16} style={{ color: folder === f.id ? '#c9a46a' : '#4a5060', flexShrink: 0 }} />
            {f.label}
          </button>
        ))}

        {/* Sync status */}
        <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2" style={{ padding: '8px 12px' }}>
            <ShieldCheck size={14} style={{ color: '#34c759', flexShrink: 0 }} />
            <span style={{ fontFamily: sfText, fontSize: 12, color: '#4a5060', letterSpacing: '-0.12px' }}>
              Mail sync active
            </span>
          </div>
          {adminProfile && (
            <div className="flex items-center gap-2 mt-2" style={{ padding: '6px 12px' }}>
              <div
                className="flex items-center justify-center shrink-0"
                style={{ width: 24, height: 24, borderRadius: 9999, background: 'rgba(201,164,106,0.15)', fontFamily: sfText, fontSize: 11, fontWeight: 600, color: '#c9a46a' }}
              >
                {(adminProfile.full_name || 'A').charAt(0)}
              </div>
              <span style={{ fontFamily: sfText, fontSize: 12, color: '#5a6070', letterSpacing: '-0.12px' }} className="truncate">
                {adminProfile.full_name || 'Admin'}
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* ── Col 2: Message list (320px) ────────────────────────────────────── */}
      <div
        className="flex flex-col shrink-0 border-r"
        style={{ width: 320, borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <h2 style={{ fontFamily: sfDisplay, fontSize: 21, fontWeight: 600, lineHeight: 1.19, letterSpacing: '0.231px', color: '#fff', marginBottom: 12 }}>
            {folders.find(f => f.id === folder)?.label}
          </h2>

          {/* Search pill */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a5060' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              style={{
                width: '100%', height: 36, padding: '0 12px 0 32px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 9999, fontFamily: sfText, fontSize: 14, color: '#fff',
                letterSpacing: '-0.224px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loading
            ? [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse mx-2 my-1" style={{ height: 72, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }} />
              ))
            : filtered.length === 0
              ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
                  <Mail size={40} style={{ color: '#4a5060' }} />
                  <span style={{ fontFamily: sfText, fontSize: 14, color: '#4a5060', letterSpacing: '-0.224px' }}>No messages</span>
                </div>
              )
              : filtered.map(msg => (
                <button
                  key={msg.id}
                  onClick={() => setSelected(msg)}
                  className="w-full text-left transition-colors"
                  style={{
                    display: 'block', padding: '11px 14px', borderRadius: 12, margin: '2px 0',
                    background: selected?.id === msg.id ? 'rgba(201,164,106,0.1)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (selected?.id !== msg.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (selected?.id !== msg.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {msg.status === 'unread' && folder === 'inbox' && (
                        <div style={{ width: 7, height: 7, borderRadius: 9999, background: '#c9a46a', flexShrink: 0 }} />
                      )}
                      <span className="truncate" style={{ fontFamily: sfText, fontSize: 14, fontWeight: msg.status === 'unread' ? 600 : 400, color: '#fff', letterSpacing: '-0.224px' }}>
                        {msg.name}
                      </span>
                    </div>
                    <span style={{ fontFamily: sfText, fontSize: 12, color: '#4a5060', letterSpacing: '-0.12px', flexShrink: 0, marginLeft: 8 }}>
                      {dateLabel(msg.created_at)}
                    </span>
                  </div>
                  <p className="truncate" style={{ fontFamily: sfText, fontSize: 14, fontWeight: 600, color: selected?.id === msg.id ? '#c9a46a' : '#a0a8b8', letterSpacing: '-0.224px', marginBottom: 2 }}>
                    {msg.subject || '(no subject)'}
                  </p>
                  <p className="line-clamp-1" style={{ fontFamily: sfText, fontSize: 14, color: '#5a6070', letterSpacing: '-0.224px' }}>
                    {msg.message}
                  </p>
                </button>
              ))
          }
        </div>
      </div>

      {/* ── Col 3: Reading pane ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
        {selected ? (
          <>
            {/* Toolbar — Apple icon row, no labels */}
            <div className="flex items-center justify-between px-8 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', height: 52 }}>
              <div className="flex items-center gap-6">
                {[
                  { icon: Trash2,    title: 'Delete',      action: () => updateMsg({ status: 'deleted' }) },
                  { icon: Archive,   title: 'Archive',     action: () => updateMsg({ status: 'archived' }) },
                  { icon: Flag,      title: 'Flag',        action: () => updateMsg({ is_flagged: !selected.is_flagged }), active: selected.is_flagged },
                  { icon: RotateCcw, title: 'Mark unread', action: () => updateMsg({ status: 'unread' }) },
                ].map(({ icon: Icon, title, action, active }) => (
                  <button
                    key={title}
                    onClick={action}
                    title={title}
                    className="active:scale-95 transition-transform"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: active ? '#c9a46a' : '#5a6070' }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#5a6070'; }}
                  >
                    <Icon size={18} fill={active ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <button
                onClick={() => replyRef.current?.focus()}
                title="Reply"
                className="active:scale-95 transition-transform"
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer', padding: '7px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, fontFamily: sfText, fontSize: 14, color: '#a0a8b8', letterSpacing: '-0.224px' }}
              >
                <Reply size={15} />
                Reply
              </button>
            </div>

            {/* Message header */}
            <div className="px-8 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontFamily: sfDisplay, fontSize: 21, fontWeight: 600, lineHeight: 1.19, letterSpacing: '0.231px', color: '#fff', marginBottom: 8 }}>
                {selected.subject || '(no subject)'}
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ width: 36, height: 36, borderRadius: 9999, background: 'rgba(201,164,106,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={18} style={{ color: '#c9a46a' }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: sfText, fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: '-0.224px', lineHeight: 1.29 }}>
                      {selected.name}
                    </p>
                    <p style={{ fontFamily: sfText, fontSize: 12, color: '#5a6070', letterSpacing: '-0.12px' }}>
                      {selected.email}
                    </p>
                  </div>
                </div>
                <span style={{ fontFamily: sfText, fontSize: 12, color: '#4a5060', letterSpacing: '-0.12px' }}>
                  {format(new Date(selected.created_at), 'MMM d, yyyy, h:mm a')}
                </span>
              </div>
            </div>

            {/* Thread scroll area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {/* Original message */}
              <p style={{ fontFamily: sfText, fontSize: 17, fontWeight: 400, lineHeight: 1.47, letterSpacing: '-0.374px', color: '#e0e0e0', whiteSpace: 'pre-wrap' }}>
                {selected.message}
              </p>

              {/* Thread replies */}
              {thread.length > 0 && (
                <div className="space-y-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {thread.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={cn('flex gap-3', msg.type === 'outbound' ? 'flex-row-reverse' : '')}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 9999, background: msg.type === 'outbound' ? 'rgba(201,164,106,0.15)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {msg.type === 'outbound'
                          ? <UserCircle size={18} style={{ color: '#c9a46a' }} />
                          : <User       size={18} style={{ color: '#5a6070' }} />
                        }
                      </div>
                      <div className={cn('max-w-[75%]', msg.type === 'outbound' ? 'items-end' : 'items-start')} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div
                          style={{
                            padding: '12px 16px',
                            borderRadius: 18,
                            background: msg.type === 'outbound' ? 'rgba(201,164,106,0.1)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${msg.type === 'outbound' ? 'rgba(201,164,106,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            fontFamily: sfText, fontSize: 17, fontWeight: 400, lineHeight: 1.47, letterSpacing: '-0.374px',
                            color: '#e0e0e0',
                          }}
                        >
                          {msg.body}
                          {msg.metadata?.document_type && (
                            <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                              <FileText size={15} style={{ color: '#c9a46a', flexShrink: 0 }} />
                              <span style={{ fontFamily: sfText, fontSize: 14, color: '#a0a8b8', letterSpacing: '-0.224px' }}>
                                {msg.metadata.document_type}
                              </span>
                            </div>
                          )}
                        </div>
                        <span style={{ fontFamily: sfText, fontSize: 12, color: '#4a5060', letterSpacing: '-0.12px' }}>
                          {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply bar */}
            <div className="px-8 pb-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                <textarea
                  ref={replyRef}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Reply…"
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendReply(); }}
                  style={{
                    width: '100%', minHeight: 96, padding: '14px 16px', background: 'transparent',
                    border: 'none', outline: 'none', resize: 'none',
                    fontFamily: sfText, fontSize: 17, fontWeight: 400, lineHeight: 1.47, letterSpacing: '-0.374px',
                    color: '#fff', boxSizing: 'border-box',
                  }}
                />
                <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontFamily: sfText, fontSize: 12, color: '#3a4050', letterSpacing: '-0.12px' }}>
                    ⌘ + Enter to send
                  </span>
                  <button
                    onClick={() => sendReply()}
                    disabled={sending || !replyText.trim()}
                    className="active:scale-95 transition-transform"
                    style={{
                      background: sending || !replyText.trim() ? 'rgba(201,164,106,0.4)' : '#c9a46a',
                      border: 'none', borderRadius: 9999, padding: '9px 20px', cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontFamily: sfText, fontSize: 14, fontWeight: 400, color: '#060b18', letterSpacing: '-0.224px',
                    }}
                  >
                    {sending
                      ? <div style={{ width: 14, height: 14, borderRadius: 9999, border: '2px solid rgba(6,11,24,0.4)', borderTopColor: '#060b18', animation: 'spin 0.8s linear infinite' }} />
                      : <SendIcon size={14} />
                    }
                    {sending ? 'Sending…' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-25">
            <Mail size={48} style={{ color: '#4a5060' }} strokeWidth={1} />
            <p style={{ fontFamily: sfText, fontSize: 17, color: '#4a5060', letterSpacing: '-0.374px' }}>
              Select a message
            </p>
          </div>
        )}
      </div>

      {/* ── Compose modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {compose && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
            style={{ background: 'rgba(6,11,24,0.85)', backdropFilter: 'blur(20px)' }}
            onClick={e => { if (e.target === e.currentTarget) setCompose(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{   opacity: 0, scale: 0.96, y: 12  }}
              transition={{ duration: 0.18 }}
              style={{
                width: '100%', maxWidth: 600,
                background: '#0d1220',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18,
                overflow: 'hidden',
              }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 style={{ fontFamily: sfDisplay, fontSize: 21, fontWeight: 600, lineHeight: 1.19, letterSpacing: '0.231px', color: '#fff' }}>
                  New Message
                </h2>
                <button
                  onClick={() => setCompose(false)}
                  className="active:scale-95 transition-transform"
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 9999, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a8b8' }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Fields */}
              <div style={{ padding: '0 24px' }}>
                {[
                  { label: 'To', value: composeTo, set: setComposeTo, type: 'email', list: 'compose-clients' },
                  { label: 'Subject', value: composeSub, set: setComposeSub, type: 'text', list: undefined },
                ].map(({ label, value, set, type, list }) => (
                  <div key={label} className="flex items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', height: 48 }}>
                    <span style={{ fontFamily: sfText, fontSize: 14, color: '#5a6070', letterSpacing: '-0.224px', width: 64, flexShrink: 0 }}>
                      {label}
                    </span>
                    <input
                      type={type}
                      list={list}
                      value={value}
                      onChange={e => set(e.target.value)}
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: sfText, fontSize: 17, color: '#fff', letterSpacing: '-0.374px' }}
                    />
                    {list && (
                      <datalist id={list}>
                        {clients.map(c => <option key={c.email} value={c.email}>{c.full_name}</option>)}
                      </datalist>
                    )}
                  </div>
                ))}

                <textarea
                  value={composeBody}
                  onChange={e => setComposeBody(e.target.value)}
                  placeholder="Message"
                  style={{
                    width: '100%', minHeight: 240, padding: '16px 0', background: 'transparent', border: 'none', outline: 'none', resize: 'none',
                    fontFamily: sfText, fontSize: 17, fontWeight: 400, lineHeight: 1.47, letterSpacing: '-0.374px', color: '#fff', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => setCompose(false)}
                  className="active:scale-95 transition-transform"
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9999, padding: '9px 20px', cursor: 'pointer', fontFamily: sfText, fontSize: 14, color: '#a0a8b8', letterSpacing: '-0.224px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendReply(true)}
                  disabled={sending || !composeTo || !composeBody.trim()}
                  className="active:scale-95 transition-transform"
                  style={{
                    background: sending || !composeTo || !composeBody.trim() ? 'rgba(201,164,106,0.4)' : '#c9a46a',
                    border: 'none', borderRadius: 9999, padding: '9px 20px', cursor: sending ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: sfText, fontSize: 14, fontWeight: 400, color: '#060b18', letterSpacing: '-0.224px',
                  }}
                >
                  {sending
                    ? <div style={{ width: 14, height: 14, borderRadius: 9999, border: '2px solid rgba(6,11,24,0.4)', borderTopColor: '#060b18', animation: 'spin 0.8s linear infinite' }} />
                    : <SendIcon size={14} />
                  }
                  {sending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
