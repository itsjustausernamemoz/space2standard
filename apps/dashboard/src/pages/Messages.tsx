import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Mail, Search, User, Reply, Trash2, X, FileText, UserCircle,
  Inbox, Send as SendIcon, Plus, Flag, RotateCcw, ShieldCheck,
  Paperclip, Download, Calendar, ShoppingCart, MessageSquare,
  ShieldOff, Tag,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const sfDisplay = 'SF Pro Display, system-ui, -apple-system, sans-serif';
const sfText    = 'SF Pro Text, system-ui, -apple-system, sans-serif';

function dateLabel(iso: string) {
  const d = new Date(iso);
  if (isToday(d))     return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'dd MMM');
}

type Folder =
  | 'inbox' | 'sent' | 'junk' | 'trash' | 'flagged'
  | 'inquiries' | 'appointments' | 'orders' | 'quotations';

interface Attachment { name: string; url: string; size: number; mimeType: string; }

const BIZ_KEYWORDS: Record<string, string[]> = {
  appointments: ['appointment', 'booking', 'schedule', 'meeting', 'visit', 'consultation', 'site visit'],
  orders:       ['order', 'purchase', 'delivery', 'shipment', 'received my', 'tracking'],
  quotations:   ['quote', 'quotation', 'estimate', 'proposal', 'pricing', 'price list', 'how much'],
};

function matchesBiz(msg: any, folder: string): boolean {
  const text = `${msg.subject || ''} ${msg.message || ''}`.toLowerCase();
  return (BIZ_KEYWORDS[folder] || []).some(k => text.includes(k));
}

const MAILBOX_FOLDERS = [
  { id: 'inbox'   as Folder, label: 'Inbox',   icon: Inbox    },
  { id: 'sent'    as Folder, label: 'Sent',    icon: SendIcon },
  { id: 'junk'    as Folder, label: 'Junk',    icon: ShieldOff },
  { id: 'trash'   as Folder, label: 'Trash',   icon: Trash2   },
  { id: 'flagged' as Folder, label: 'Flagged', icon: Flag     },
];

const BUSINESS_FOLDERS = [
  { id: 'inquiries'    as Folder, label: 'Inquiries',    icon: MessageSquare },
  { id: 'appointments' as Folder, label: 'Appointments', icon: Calendar      },
  { id: 'orders'       as Folder, label: 'Orders',       icon: ShoppingCart  },
  { id: 'quotations'   as Folder, label: 'Quotations',   icon: Tag           },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const Messages = () => {
  const [allInbox,       setAllInbox]       = useState<any[]>([]);
  const [inquiries,      setInquiries]      = useState<any[]>([]);
  const [selected,       setSelected]       = useState<any>(null);
  const [thread,         setThread]         = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [replyText,      setReplyText]      = useState('');
  const [replyFiles,     setReplyFiles]     = useState<File[]>([]);
  const [sending,        setSending]        = useState(false);
  const [search,         setSearch]         = useState('');
  const [adminProfile,   setAdminProfile]   = useState<any>(null);
  const [folder,         setFolder]         = useState<Folder>('inbox');
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [compose,        setCompose]        = useState(false);
  const [composeTo,      setComposeTo]      = useState('');
  const [composeSub,     setComposeSub]     = useState('');
  const [composeBody,    setComposeBody]    = useState('');
  const [composeFiles,   setComposeFiles]   = useState<File[]>([]);
  const [clients,        setClients]        = useState<any[]>([]);

  const scrollRef       = useRef<HTMLDivElement>(null);
  const replyRef        = useRef<HTMLTextAreaElement>(null);
  const replyFileRef    = useRef<HTMLInputElement>(null);
  const composeFileRef  = useRef<HTMLInputElement>(null);

  // ── Init ──────────────────────────────────────────────────────────────────
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

  // ── Data ─────────────────────────────────────────────────────────────────
  async function fetchAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setAdminProfile(data);
    }
  }

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('full_name, email').limit(50);
    setClients(data || []);
  }

  async function fetchMessages() {
    setLoading(true);

    if (folder === 'inbox' || ['inquiries', 'appointments', 'orders', 'quotations', 'flagged'].includes(folder)) {
      const [{ data: cm }, { data: il }] = await Promise.all([
        supabase.from('contact_messages')
          .select('*')
          .not('status', 'in', '("deleted","junk")')
          .order('created_at', { ascending: false }),
        supabase.from('communication_logs')
          .select('*')
          .eq('type', 'inbound')
          .not('status', 'in', '("deleted","junk")')
          .order('created_at', { ascending: false }),
      ]);

      const base = [
        ...(cm || []).map((m: any) => ({ ...m, source: 'storefront' })),
        ...(il || []).map((l: any) => ({
          id: l.id, name: l.sender_name, email: l.sender_email,
          subject: l.subject, message: l.body, created_at: l.created_at,
          status: l.status || 'unread', is_flagged: l.is_flagged,
          metadata: l.metadata, source: 'email', isLog: true,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAllInbox(base);
      setUnreadCount(base.filter(m => m.status === 'unread').length);

      if (folder === 'flagged') {
        setInquiries(base.filter(m => m.is_flagged));
      } else if (folder === 'inquiries') {
        setInquiries(base.filter(m =>
          !matchesBiz(m, 'appointments') && !matchesBiz(m, 'orders') && !matchesBiz(m, 'quotations')
        ));
      } else if (['appointments', 'orders', 'quotations'].includes(folder)) {
        setInquiries(base.filter(m => matchesBiz(m, folder)));
      } else {
        setInquiries(base);
      }

    } else if (folder === 'sent') {
      const { data } = await supabase.from('communication_logs')
        .select('*').eq('type', 'outbound').is('parent_id', null)
        .order('created_at', { ascending: false });
      setInquiries((data || []).map((d: any) => ({
        id: d.id,
        name: d.recipient_email?.split('@')[0] || d.recipient_email,
        email: d.recipient_email,
        subject: d.subject, message: d.body, created_at: d.created_at,
        status: 'sent', is_flagged: d.is_flagged, metadata: d.metadata, isLog: true,
      })));

    } else if (folder === 'junk') {
      const [{ data: cm }, { data: cl }] = await Promise.all([
        supabase.from('contact_messages').select('*').eq('status', 'junk'),
        supabase.from('communication_logs').select('*').eq('status', 'junk'),
      ]);
      setInquiries([
        ...(cm || []).map((m: any) => ({ ...m, source: 'storefront' })),
        ...(cl || []).map((l: any) => ({
          id: l.id, name: l.sender_name, email: l.sender_email,
          subject: l.subject, message: l.body, created_at: l.created_at,
          status: l.status, is_flagged: l.is_flagged, metadata: l.metadata, isLog: true,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

    } else {
      const [{ data: cm }, { data: cl }] = await Promise.all([
        supabase.from('contact_messages').select('*').eq('status', 'deleted'),
        supabase.from('communication_logs').select('*').eq('status', 'deleted'),
      ]);
      setInquiries([
        ...(cm || []).map((m: any) => ({ ...m, source: 'storefront' })),
        ...(cl || []).map((l: any) => ({
          id: l.id, name: l.sender_name, email: l.sender_email,
          subject: l.subject, message: l.body, created_at: l.created_at,
          status: l.status, is_flagged: l.is_flagged, metadata: l.metadata, isLog: true,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
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

  // ── Attachments ───────────────────────────────────────────────────────────
  async function uploadFiles(files: File[]): Promise<Attachment[]> {
    const results: Attachment[] = [];
    for (const file of files) {
      const path = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(path, file, { upsert: false });
      if (error) {
        toast.error(`Could not upload ${file.name}: ${error.message}`);
        continue;
      }
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(data.path);
      results.push({ name: file.name, url: publicUrl, size: file.size, mimeType: file.type });
    }
    return results;
  }

  // ── Send ──────────────────────────────────────────────────────────────────
  const sendReply = async (manual = false) => {
    const to      = manual ? composeTo  : selected?.email;
    const subject = manual ? composeSub : `Re: ${selected?.subject || 'Your Inquiry'}`;
    const body    = manual ? composeBody : replyText;
    const name    = manual
      ? (clients.find(c => c.email === to)?.full_name || to)
      : selected?.name;
    const files   = manual ? composeFiles : replyFiles;

    if (!to || !body.trim()) return;

    setSending(true);
    try {
      const attachments = files.length > 0 ? await uploadFiles(files) : [];

      const { data: { session } } = await supabase.auth.getSession();
      const adminId = session?.user?.id;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          to, recipientName: name, subject, message: body,
          adminName: adminProfile?.full_name || 'Admin',
          attachments,
        }),
      });
      if (!res.ok) throw new Error('Send failed');

      // Log outbound message — best-effort; a logging failure must never surface as a send error
      const logEntry: Record<string, any> = {
        type: 'outbound',
        sender_name: adminProfile?.full_name || 'Admin',
        sender_email: 'studio@space2standard.com',
        recipient_email: to, subject, body,
        admin_id: adminId,
      };
      if (attachments.length > 0) logEntry.metadata = { attachments };

      const { error: logError } = await supabase.from('communication_logs').insert(logEntry);
      if (logError) console.warn('Outbound log failed:', logError.message);

      if (!manual && !selected?.isLog) {
        await supabase.from('contact_messages').update({ status: 'replied' }).eq('id', selected.id);
      }

      toast.success('Message sent.');
      if (manual) {
        setCompose(false);
        setComposeTo(''); setComposeSub(''); setComposeBody(''); setComposeFiles([]);
      } else {
        setReplyText(''); setReplyFiles([]);
      }
      fetchMessages();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = inquiries.filter(m =>
    `${m.name} ${m.subject} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  );

  // ── Attachment chips ──────────────────────────────────────────────────────
  const AttachmentChips = ({
    files, onRemove,
  }: { files: File[]; onRemove: (i: number) => void }) => (
    <div className="flex flex-wrap gap-2 px-4 pt-2">
      {files.map((f, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5"
          style={{ background: 'rgba(201,164,106,0.1)', border: '1px solid rgba(201,164,106,0.2)', borderRadius: 8, padding: '4px 10px' }}
        >
          <Paperclip size={12} style={{ color: '#c9a46a', flexShrink: 0 }} />
          <span style={{ fontFamily: sfText, fontSize: 12, color: '#c9a46a', letterSpacing: '-0.12px', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {f.name}
          </span>
          <span style={{ fontFamily: sfText, fontSize: 11, color: '#5a6070' }}>
            {formatBytes(f.size)}
          </span>
          <button
            onClick={() => onRemove(i)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#5a6070', display: 'flex', alignItems: 'center', marginLeft: 2 }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );

  // ── Thread attachment display ─────────────────────────────────────────────
  const MsgAttachments = ({ attachments }: { attachments: Attachment[] }) => (
    <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      {attachments.map((att, i) => (
        <a
          key={i}
          href={att.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 no-underline"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px' }}
        >
          <FileText size={14} style={{ color: '#c9a46a', flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: sfText, fontSize: 12, color: '#e0e0e0', letterSpacing: '-0.12px', margin: 0, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {att.name}
            </p>
            <p style={{ fontFamily: sfText, fontSize: 11, color: '#5a6070', margin: 0 }}>
              {formatBytes(att.size)}
            </p>
          </div>
          <Download size={13} style={{ color: '#5a6070', flexShrink: 0 }} />
        </a>
      ))}
    </div>
  );

  // ── Sidebar folder button ─────────────────────────────────────────────────
  const FolderBtn = ({ id, label, icon: Icon, badge }: { id: Folder; label: string; icon: any; badge?: number }) => (
    <button
      onClick={() => { setFolder(id); setSelected(null); }}
      className="w-full flex items-center gap-2.5 transition-colors text-left"
      style={{
        padding: '8px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
        background: folder === id ? 'rgba(201,164,106,0.12)' : 'transparent',
        fontFamily: sfText, fontSize: 13, fontWeight: folder === id ? 600 : 400,
        letterSpacing: '-0.16px', color: folder === id ? '#c9a46a' : '#6a7080',
      }}
    >
      <Icon size={15} style={{ color: folder === id ? '#c9a46a' : '#4a5060', flexShrink: 0 }} />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span style={{ background: '#c9a46a', color: '#060b18', borderRadius: 9999, padding: '1px 6px', fontSize: 11, fontWeight: 600, minWidth: 18, textAlign: 'center' }}>
          {badge}
        </span>
      )}
    </button>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-x-4 lg:inset-x-8 top-28 bottom-6 flex overflow-hidden"
      style={{ background: 'rgba(6,11,24,0.7)', backdropFilter: 'blur(40px) saturate(180%)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)' }}
    >

      {/* ── Col 1: Folder sidebar (200px) ──────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col shrink-0 py-5 gap-0.5 overflow-y-auto"
        style={{ width: 200, borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 10px' }}
      >
        {/* Compose */}
        <button
          onClick={() => setCompose(true)}
          className="flex items-center gap-2 mb-5 active:scale-95 transition-transform"
          style={{ background: '#c9a46a', borderRadius: 9999, padding: '9px 16px', border: 'none', cursor: 'pointer', fontFamily: sfText, fontSize: 13, fontWeight: 400, color: '#060b18', letterSpacing: '-0.16px', alignSelf: 'flex-start' }}
        >
          <Plus size={14} />
          New Message
        </button>

        {/* Mailboxes section */}
        <p style={{ fontFamily: sfText, fontSize: 11, fontWeight: 600, color: '#3a4050', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 10px 6px', margin: '4px 0 2px' }}>
          Mailboxes
        </p>
        {MAILBOX_FOLDERS.map(f => (
          <FolderBtn key={f.id} id={f.id} label={f.label} icon={f.icon} badge={f.id === 'inbox' ? unreadCount : undefined} />
        ))}

        {/* Business section */}
        <p style={{ fontFamily: sfText, fontSize: 11, fontWeight: 600, color: '#3a4050', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 10px 6px', margin: '12px 0 2px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          Business
        </p>
        {BUSINESS_FOLDERS.map(f => (
          <FolderBtn key={f.id} id={f.id} label={f.label} icon={f.icon} />
        ))}

        {/* Account footer */}
        <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2 px-2.5 mb-2">
            <ShieldCheck size={13} style={{ color: '#34c759', flexShrink: 0 }} />
            <span style={{ fontFamily: sfText, fontSize: 11, color: '#4a5060', letterSpacing: '-0.08px' }}>
              Mail sync active
            </span>
          </div>
          {adminProfile && (
            <div className="flex items-center gap-2 px-2.5">
              <div style={{ width: 22, height: 22, borderRadius: 9999, background: 'rgba(201,164,106,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: sfText, fontSize: 10, fontWeight: 600, color: '#c9a46a' }}>
                  {(adminProfile.full_name || 'A').charAt(0)}
                </span>
              </div>
              <span style={{ fontFamily: sfText, fontSize: 11, color: '#5a6070', letterSpacing: '-0.08px' }} className="truncate">
                {adminProfile.full_name || 'Admin'}
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* ── Col 2: Message list (300px) ────────────────────────────────────── */}
      <div className="flex flex-col shrink-0" style={{ width: 300, borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-4 pt-5 pb-3 shrink-0">
          <h2 style={{ fontFamily: sfDisplay, fontSize: 20, fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.28px', color: '#fff', marginBottom: 10 }}>
            {[...MAILBOX_FOLDERS, ...BUSINESS_FOLDERS].find(f => f.id === folder)?.label ?? 'Inbox'}
          </h2>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a5060' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              style={{
                width: '100%', height: 34, padding: '0 12px 0 30px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 9999, fontFamily: sfText, fontSize: 13, color: '#fff',
                letterSpacing: '-0.16px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loading
            ? [1,2,3,4,5].map(i => (
                <div key={i} className="animate-pulse mx-2 my-1" style={{ height: 72, borderRadius: 10, background: 'rgba(255,255,255,0.04)' }} />
              ))
            : filtered.length === 0
              ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 opacity-25">
                  <Mail size={36} style={{ color: '#4a5060' }} strokeWidth={1} />
                  <span style={{ fontFamily: sfText, fontSize: 13, color: '#4a5060', letterSpacing: '-0.16px' }}>No messages</span>
                </div>
              )
              : filtered.map(msg => (
                <button
                  key={msg.id}
                  onClick={() => setSelected(msg)}
                  className="w-full text-left transition-colors"
                  style={{
                    display: 'block', padding: '10px 12px', borderRadius: 10, margin: '1px 0',
                    background: selected?.id === msg.id ? 'rgba(201,164,106,0.1)' : 'transparent',
                    border: '1px solid transparent',
                    ...(selected?.id === msg.id ? { borderColor: 'rgba(201,164,106,0.15)' } : {}),
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (selected?.id !== msg.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (selected?.id !== msg.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {msg.status === 'unread' && folder !== 'sent' && (
                        <div style={{ width: 6, height: 6, borderRadius: 9999, background: '#c9a46a', flexShrink: 0 }} />
                      )}
                      <span className="truncate" style={{ fontFamily: sfText, fontSize: 13, fontWeight: msg.status === 'unread' ? 600 : 400, color: '#e8e8e8', letterSpacing: '-0.16px' }}>
                        {msg.name}
                      </span>
                    </div>
                    <span style={{ fontFamily: sfText, fontSize: 11, color: '#4a5060', letterSpacing: '-0.08px', flexShrink: 0, marginLeft: 6 }}>
                      {dateLabel(msg.created_at)}
                    </span>
                  </div>
                  <p className="truncate" style={{ fontFamily: sfText, fontSize: 13, fontWeight: 500, color: selected?.id === msg.id ? '#c9a46a' : '#8a9ab0', letterSpacing: '-0.16px', marginBottom: 2 }}>
                    {msg.subject || '(no subject)'}
                  </p>
                  <p className="line-clamp-1" style={{ fontFamily: sfText, fontSize: 12, color: '#4a5060', letterSpacing: '-0.12px' }}>
                    {msg.message}
                  </p>
                  {msg.is_flagged && (
                    <Flag size={11} style={{ color: '#c9a46a', marginTop: 4 }} fill="currentColor" />
                  )}
                </button>
              ))
          }
        </div>
      </div>

      {/* ── Col 3: Reading pane ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', height: 50 }}>
              <div className="flex items-center gap-5">
                {[
                  { icon: Trash2,     title: 'Move to Trash', action: () => { updateMsg({ status: 'deleted' }); setSelected(null); } },
                  { icon: ShieldOff,  title: 'Move to Junk',  action: () => { updateMsg({ status: 'junk' }); setSelected(null); } },
                  { icon: Flag,       title: selected.is_flagged ? 'Unflag' : 'Flag', action: () => updateMsg({ is_flagged: !selected.is_flagged }), active: selected.is_flagged },
                  { icon: RotateCcw,  title: 'Mark as Unread', action: () => updateMsg({ status: 'unread' }) },
                ].map(({ icon: Icon, title, action, active }) => (
                  <button
                    key={title}
                    onClick={action}
                    title={title}
                    className="active:scale-95 transition-transform"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: active ? '#c9a46a' : '#5a6070', display: 'flex', alignItems: 'center', borderRadius: 6 }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#e0e0e0'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#5a6070'; }}
                  >
                    <Icon size={16} fill={active ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <button
                onClick={() => replyRef.current?.focus()}
                className="active:scale-95 transition-transform flex items-center gap-1.5"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', padding: '6px 14px', borderRadius: 8, fontFamily: sfText, fontSize: 13, color: '#a0a8b8', letterSpacing: '-0.16px' }}
              >
                <Reply size={14} />
                Reply
              </button>
            </div>

            {/* Message header */}
            <div className="px-8 pt-5 pb-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontFamily: sfDisplay, fontSize: 20, fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.28px', color: '#fff', marginBottom: 10 }}>
                {selected.subject || '(no subject)'}
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ width: 34, height: 34, borderRadius: 9999, background: 'rgba(201,164,106,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={16} style={{ color: '#c9a46a' }} />
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

            {/* Thread */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              <p style={{ fontFamily: sfText, fontSize: 17, fontWeight: 400, lineHeight: 1.47, letterSpacing: '-0.374px', color: '#d8d8d8', whiteSpace: 'pre-wrap' }}>
                {selected.message}
              </p>
              {selected.metadata?.attachments?.length > 0 && (
                <MsgAttachments attachments={selected.metadata.attachments} />
              )}

              {thread.length > 0 && (
                <div className="space-y-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {thread.map((msg: any) => (
                    <div key={msg.id} className={cn('flex gap-3', msg.type === 'outbound' ? 'flex-row-reverse' : '')}>
                      <div style={{ width: 30, height: 30, borderRadius: 9999, background: msg.type === 'outbound' ? 'rgba(201,164,106,0.15)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {msg.type === 'outbound'
                          ? <UserCircle size={16} style={{ color: '#c9a46a' }} />
                          : <User       size={16} style={{ color: '#5a6070' }} />
                        }
                      </div>
                      <div className="max-w-[75%] flex flex-col gap-1" style={{ alignItems: msg.type === 'outbound' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          padding: '12px 16px', borderRadius: 18,
                          background: msg.type === 'outbound' ? 'rgba(201,164,106,0.08)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${msg.type === 'outbound' ? 'rgba(201,164,106,0.18)' : 'rgba(255,255,255,0.06)'}`,
                          fontFamily: sfText, fontSize: 15, fontWeight: 400, lineHeight: 1.47, letterSpacing: '-0.24px', color: '#d8d8d8',
                        }}>
                          {msg.body}
                          {msg.metadata?.attachments?.length > 0 && (
                            <MsgAttachments attachments={msg.metadata.attachments} />
                          )}
                        </div>
                        <span style={{ fontFamily: sfText, fontSize: 11, color: '#4a5060', letterSpacing: '-0.08px' }}>
                          {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply bar */}
            <div className="px-6 pb-5 pt-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                <textarea
                  ref={replyRef}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Reply to ${selected.name}…`}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && replyText.trim()) sendReply(); }}
                  style={{
                    width: '100%', minHeight: 80, padding: '12px 16px',
                    background: 'transparent', border: 'none', outline: 'none', resize: 'none',
                    fontFamily: sfText, fontSize: 15, fontWeight: 400, lineHeight: 1.47,
                    letterSpacing: '-0.24px', color: '#fff', boxSizing: 'border-box',
                  }}
                />
                {replyFiles.length > 0 && (
                  <AttachmentChips files={replyFiles} onRemove={i => setReplyFiles(f => f.filter((_, j) => j !== i))} />
                )}
                <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => replyFileRef.current?.click()}
                      title="Attach file"
                      className="active:scale-95 transition-transform"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#5a6070', display: 'flex', alignItems: 'center', borderRadius: 6 }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#c9a46a'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#5a6070'}
                    >
                      <Paperclip size={16} />
                    </button>
                    <input
                      ref={replyFileRef}
                      type="file"
                      multiple
                      style={{ display: 'none' }}
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        setReplyFiles(prev => [...prev, ...files]);
                        e.target.value = '';
                      }}
                    />
                    <span style={{ fontFamily: sfText, fontSize: 11, color: '#3a4050', letterSpacing: '-0.08px' }}>
                      ⌘ + Enter to send
                    </span>
                  </div>
                  <button
                    onClick={() => sendReply()}
                    disabled={sending || (!replyText.trim() && replyFiles.length === 0)}
                    className="active:scale-95 transition-transform"
                    style={{
                      background: sending || (!replyText.trim() && replyFiles.length === 0) ? 'rgba(201,164,106,0.35)' : '#c9a46a',
                      border: 'none', borderRadius: 9999, padding: '8px 18px', cursor: sending ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: 7,
                      fontFamily: sfText, fontSize: 13, fontWeight: 400, color: '#060b18', letterSpacing: '-0.16px',
                    }}
                  >
                    {sending
                      ? <div style={{ width: 12, height: 12, borderRadius: 9999, border: '2px solid rgba(6,11,24,0.3)', borderTopColor: '#060b18', animation: 'spin 0.8s linear infinite' }} />
                      : <SendIcon size={13} />
                    }
                    {sending ? 'Sending…' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-20">
            <Mail size={44} style={{ color: '#4a5060' }} strokeWidth={1} />
            <p style={{ fontFamily: sfText, fontSize: 15, color: '#4a5060', letterSpacing: '-0.24px' }}>
              Select a message
            </p>
          </div>
        )}
      </div>

      {/* ── Compose modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {compose && (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-end p-6"
            style={{ pointerEvents: 'none' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{   opacity: 0, scale: 0.96, y: 16  }}
              transition={{ duration: 0.18 }}
              style={{
                width: 560, pointerEvents: 'auto',
                background: '#0d1220',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18, overflow: 'hidden',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <h2 style={{ fontFamily: sfDisplay, fontSize: 15, fontWeight: 600, letterSpacing: '-0.2px', color: '#fff' }}>
                  New Message
                </h2>
                <button
                  onClick={() => { setCompose(false); setComposeTo(''); setComposeSub(''); setComposeBody(''); setComposeFiles([]); }}
                  className="active:scale-95 transition-transform"
                  style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 9999, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a8b8' }}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Fields */}
              <div>
                {[
                  { label: 'To',      value: composeTo,  set: setComposeTo,  type: 'email', list: 'compose-clients' },
                  { label: 'Subject', value: composeSub, set: setComposeSub, type: 'text',  list: undefined },
                ].map(({ label, value, set, type, list }) => (
                  <div key={label} className="flex items-center px-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', height: 44 }}>
                    <span style={{ fontFamily: sfText, fontSize: 13, color: '#5a6070', letterSpacing: '-0.16px', width: 58, flexShrink: 0 }}>
                      {label}
                    </span>
                    <input
                      type={type}
                      list={list}
                      value={value}
                      onChange={e => set(e.target.value)}
                      placeholder={label === 'To' ? 'recipient@example.com' : 'Subject'}
                      style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: sfText, fontSize: 15, color: '#fff', letterSpacing: '-0.24px' }}
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
                  placeholder="Write your message…"
                  style={{
                    width: '100%', minHeight: 220, padding: '14px 20px',
                    background: 'transparent', border: 'none', outline: 'none', resize: 'none',
                    fontFamily: sfText, fontSize: 15, fontWeight: 400, lineHeight: 1.47,
                    letterSpacing: '-0.24px', color: '#fff', boxSizing: 'border-box',
                  }}
                />

                {composeFiles.length > 0 && (
                  <AttachmentChips files={composeFiles} onRemove={i => setComposeFiles(f => f.filter((_, j) => j !== i))} />
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => composeFileRef.current?.click()}
                  title="Attach file"
                  className="active:scale-95 transition-transform flex items-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontFamily: sfText, fontSize: 13, color: '#8a9ab0', letterSpacing: '-0.16px' }}
                >
                  <Paperclip size={14} />
                  Attach
                </button>
                <input
                  ref={composeFileRef}
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => {
                    const files = Array.from(e.target.files || []);
                    setComposeFiles(prev => [...prev, ...files]);
                    e.target.value = '';
                  }}
                />

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => { setCompose(false); setComposeTo(''); setComposeSub(''); setComposeBody(''); setComposeFiles([]); }}
                    className="active:scale-95 transition-transform"
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9999, padding: '8px 18px', cursor: 'pointer', fontFamily: sfText, fontSize: 13, color: '#8a9ab0', letterSpacing: '-0.16px' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => sendReply(true)}
                    disabled={sending || !composeTo || !composeBody.trim()}
                    className="active:scale-95 transition-transform"
                    style={{
                      background: sending || !composeTo || !composeBody.trim() ? 'rgba(201,164,106,0.35)' : '#c9a46a',
                      border: 'none', borderRadius: 9999, padding: '8px 18px', cursor: sending ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: 7,
                      fontFamily: sfText, fontSize: 13, fontWeight: 400, color: '#060b18', letterSpacing: '-0.16px',
                    }}
                  >
                    {sending
                      ? <div style={{ width: 12, height: 12, borderRadius: 9999, border: '2px solid rgba(6,11,24,0.3)', borderTopColor: '#060b18', animation: 'spin 0.8s linear infinite' }} />
                      : <SendIcon size={13} />
                    }
                    {sending ? 'Sending…' : 'Send'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
