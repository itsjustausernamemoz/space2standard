import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  Search, 
  ChevronRight, 
  User, 
  Reply,
  Trash2,
  X,
  FileText,
  UserCircle,
  Inbox,
  Send as SendIcon,
  Archive,
  Plus,
  ArrowLeft,
  Circle,
  MoreVertical,
  Flag,
  RotateCcw,
  Maximize2,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Messages = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [threadHistory, setThreadHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'trash'>('inbox');
  
  // Compose modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [isSearchingClient, setIsSearchingClient] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchAdminProfile();
    fetchClients();

    // Enable Supabase Realtime for live "Push" sync
    const channel = supabase
      .channel('messages_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'communication_logs' }, () => {
        fetchMessages();
        if (selectedThread) fetchThreadHistory(selectedThread);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeFolder, selectedThread]);

  useEffect(() => {
    if (selectedThread) {
      fetchThreadHistory(selectedThread);
    } else {
      setThreadHistory([]);
    }
  }, [selectedThread]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [threadHistory]);

  async function fetchAdminProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setAdminProfile(data);
    }
  }

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('full_name, email').limit(20);
    setClients(data || []);
  }

  async function fetchMessages() {
    setLoading(true);
    if (activeFolder === 'inbox') {
      // 1. Fetch Storefront inquiries (strictly exclude archived/deleted)
      const { data: inquiriesData } = await supabase
        .from('contact_messages')
        .select('*')
        .or('status.is.null,status.not.in.("archived","deleted")')
        .order('created_at', { ascending: false });

      // 2. Fetch External Inbound Emails (strictly exclude archived/deleted)
      const { data: inboundLogs } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('type', 'inbound')
        .or('status.is.null,status.not.in.("archived","deleted")')
        .order('created_at', { ascending: false });

      const unifiedMessages = [
        ...(inquiriesData || []).map((m: any) => ({ ...m, source: 'storefront' })),
        ...(inboundLogs || []).map((l: any) => ({
          id: l.id,
          name: l.sender_name,
          email: l.sender_email,
          subject: l.subject,
          message: l.body,
          created_at: l.created_at,
          status: l.status || 'unread',
          is_flagged: l.is_flagged,
          source: 'email',
          isLog: true
        }))
      ].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });

      setInquiries(unifiedMessages);
    } else if (activeFolder === 'sent') {
      const { data } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('type', 'outbound')
        .is('parent_id', null)
        .order('created_at', { ascending: false });
      
      setInquiries(data?.map(d => ({
        id: d.id,
        name: d.recipient_email.split('@')[0], 
        email: d.recipient_email,
        subject: d.subject,
        message: d.body,
        created_at: d.created_at,
        status: 'replied',
        is_flagged: d.is_flagged,
        isLog: true
      })) || []);
    } else {
      // Archive or Trash
      const statusFilter = activeFolder === 'trash' ? 'deleted' : 'archived';
      
      const [contRes, commRes] = await Promise.all([
        supabase.from('contact_messages').select('*').eq('status', statusFilter),
        supabase.from('communication_logs').select('*').eq('status', statusFilter)
      ]);

      const unified = [
        ...(contRes.data || []).map((m: any) => ({ ...m, source: 'storefront' })),
        ...(commRes.data || []).map((l: any) => ({
          id: l.id,
          name: l.sender_name,
          email: l.sender_email,
          subject: l.subject,
          message: l.body,
          created_at: l.created_at,
          status: l.status,
          is_flagged: l.is_flagged,
          source: 'email',
          isLog: true
        }))
      ].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });

      setInquiries(unified);
    }
    setLoading(false);
  }

  async function fetchThreadHistory(inquiry: any) {
    setLoadingThread(true);
    const { data } = await supabase
      .from('communication_logs')
      .select('*')
      .or(`recipient_email.eq.${inquiry.email},sender_email.eq.${inquiry.email}`)
      .order('created_at', { ascending: true });

    if (data) setThreadHistory(data);
    setLoadingThread(false);
  }

  const handleDispatch = async (isManual = false) => {
    const targetEmail = isManual ? composeTo : selectedThread.email;
    const targetSubject = isManual ? composeSubject : (selectedThread.subject?.startsWith('Re:') ? selectedThread.subject : `Re: ${selectedThread.subject || 'Your Inquiry'}`);
    const targetBody = isManual ? composeBody : replyText;
    const targetName = isManual ? (clients.find(c => c.email === composeTo)?.full_name || 'Valued Client') : selectedThread.name;

    if (!targetEmail || !targetBody) return;
    
    setSendingReply(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          to: targetEmail,
          recipientName: targetName,
          subject: targetSubject,
          message: targetBody,
          adminName: adminProfile?.full_name || 'Artisan Admin'
        })
      });

      if (!response.ok) throw new Error('Transmission failed');

      await supabase.from('communication_logs').insert({
        type: 'outbound',
        sender_name: adminProfile?.full_name || 'Admin',
        sender_email: 'studio@space2standard.com',
        recipient_email: targetEmail,
        subject: targetSubject,
        body: targetBody,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (!isManual && !selectedThread.isLog) {
        await supabase.from('contact_messages').update({ status: 'replied' }).eq('id', selectedThread.id);
      }

      toast.success('Excellence dispatched.');
      if (isManual) {
        setIsComposeOpen(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
      } else {
        setReplyText('');
      }
      fetchMessages();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSendingReply(false);
    }
  };

  const updateMessageState = async (updates: any) => {
    if (!selectedThread) return;
    try {
      const table = selectedThread.isLog ? 'communication_logs' : 'contact_messages';
      const { error } = await supabase.from(table).update(updates).eq('id', selectedThread.id);
      if (error) throw error;
      
      setSelectedThread({ ...selectedThread, ...updates });
      fetchMessages();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleArchive = () => updateMessageState({ status: 'archived' });
  const handleDelete = () => updateMessageState({ status: 'deleted' });
  const handleToggleFlag = () => updateMessageState({ is_flagged: !selectedThread.is_flagged });
  const handleMarkUnread = () => updateMessageState({ status: 'unread' });
  const handleSmallReply = () => replyRef.current?.focus();

  const formatDateLabel = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'h:mm a');
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'dd/MM/yy');
  };

  return (
    <div className="fixed inset-x-8 top-32 bottom-8 flex bg-[#060b18]/40 backdrop-blur-3xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      {/* 1. APPLE NAVIGATION SIDEBAR */}
      <div className="w-64 apple-glass shrink-0 py-10 px-6 flex flex-col gap-10">
        <button 
           onClick={() => setIsComposeOpen(true)}
           className="w-12 h-12 bg-gold-500 rounded-2xl flex items-center justify-center text-navy-950 shadow-lg hover:bg-white transition-all active:scale-95 group"
        >
           <Plus size={24} />
        </button>

        <div className="space-y-6">
           <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-navy-600 px-2">Mailboxes</h3>
              <nav className="space-y-1">
                 {[
                   { id: 'inbox', label: 'All Inboxes', icon: Inbox },
                   { id: 'sent', label: 'Sent', icon: SendIcon },
                   { id: 'archive', label: 'Archive', icon: Archive },
                   { id: 'trash', label: 'Trash', icon: Trash2 },
                 ].map((folder) => (
                   <button 
                     key={folder.id}
                     onClick={() => { setActiveFolder(folder.id as any); setSelectedThread(null); }}
                     className={cn(
                       "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                       activeFolder === folder.id ? "bg-white/10 text-white" : "text-navy-500 hover:bg-white/5"
                     )}
                   >
                      <folder.icon size={18} className={activeFolder === folder.id ? "text-gold-500" : "text-navy-700"} />
                      <span className="text-xs font-medium">{folder.label}</span>
                   </button>
                 ))}
              </nav>
           </div>
        </div>

        <div className="mt-auto space-y-6">
           <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                 <span className="text-[9px] font-black uppercase tracking-widest text-navy-600">Sync Status</span>
                 <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
                    <div className="w-1 h-1 rounded-full bg-success/40" />
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-success/10 rounded-lg text-success"><ShieldCheck size={14} /></div>
                 <span className="text-[10px] font-bold text-navy-400">External Mail Active</span>
              </div>
           </div>

           <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 font-bold text-[10px]">
                 {adminProfile?.full_name?.split(' ').map((n:any) => n[0]).join('') || 'A'}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500 truncate">
                 {adminProfile?.full_name || 'Artisan Admin'}
              </div>
           </div>
        </div>
      </div>

      {/* 2. APPLE MESSAGE LIST */}
      <div className="w-[380px] shrink-0 flex flex-col border-r border-white/5 bg-navy-900/10">
        <div className="p-8 pb-4">
           <h2 className="text-2xl font-serif text-white mb-6">{activeFolder.charAt(0).toUpperCase() + activeFolder.slice(1)}</h2>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-700" size={14} />
              <input 
                 className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-navy-800 focus:outline-none focus:bg-white/[0.08] transition-all"
                 placeholder="Search mail..."
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-1 mt-4">
           {loading ? (
             [1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl mb-2" />)
           ) : inquiries.length > 0 ? inquiries.filter((m: any) => 
             m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             m.subject?.toLowerCase().includes(searchQuery.toLowerCase())
           ).map((msg: any) => (
             <button 
               key={msg.id}
               onClick={() => setSelectedThread(msg)}
               className={cn(
                 "w-full text-left p-5 rounded-2xl transition-all group relative",
                 selectedThread?.id === msg.id ? "bg-white/10" : "hover:bg-white/[0.03]"
               )}
             >
                <div className="flex justify-between items-start mb-1">
                   <div className="flex items-center gap-2">
                      {msg.status === 'unread' && activeFolder === 'inbox' && (
                        <div className="w-2 h-2 rounded-full bg-gold-500" />
                      )}
                      <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[140px]">{msg.name}</h4>
                   </div>
                   <span className="text-[10px] text-navy-700 font-medium">{formatDateLabel(msg.created_at)}</span>
                </div>
                <p className={cn(
                  "text-xs font-medium truncate mb-1",
                  selectedThread?.id === msg.id ? "text-gold-500" : "text-white/80"
                )}>{msg.subject || 'Artisan Thread'}</p>
                <div className="flex items-center justify-between gap-4">
                    <p className="text-[11px] text-navy-600 line-clamp-2 leading-relaxed italic flex-1">{msg.message}</p>
                    {msg.is_flagged && <Flag size={10} className="text-gold-500 fill-gold-500 shrink-0" />}
                </div>
             </button>
           )) : (
             <div className="h-64 flex items-center justify-center text-navy-800 italic text-[11px] uppercase tracking-widest font-bold">Empty Mailbox</div>
           )}
        </div>
      </div>

      {/* 3. APPLE READING PANE */}
      <div className="flex-1 flex flex-col reading-pane bg-navy-900/5 overflow-hidden">
        {selectedThread ? (
          <>
            {/* Toolbar */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center px-10">
               <div className="flex gap-8">
                  <button onClick={handleDelete} className="text-navy-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                  <button onClick={handleArchive} className="text-navy-500 hover:text-white transition-all"><Archive size={20} /></button>
                  <button onClick={handleToggleFlag} className={cn("transition-all", selectedThread.is_flagged ? "text-gold-500" : "text-navy-500 hover:text-white")}><Flag size={20} fill={selectedThread.is_flagged ? "currentColor" : "none"}/></button>
                  <button onClick={handleMarkUnread} className="text-navy-500 hover:text-white transition-all"><RotateCcw size={20} /></button>
               </div>
               <div className="flex gap-4">
                  <button onClick={handleSmallReply} className="p-2 text-navy-700 bg-white/5 rounded-lg hover:text-white"><Reply size={18} /></button>
                  <button onClick={() => setIsMaximized(!isMaximized)} className={cn("p-2 rounded-lg transition-all", isMaximized ? "bg-gold-500 text-navy-950" : "text-navy-700 bg-white/5 hover:text-white")}><Maximize2 size={18} /></button>
               </div>
            </div>

            {/* Reading Content */}
            <div ref={scrollRef} className={cn(
              "flex-1 overflow-y-auto px-12 py-12 space-y-12 transition-all duration-700",
              isMaximized ? "max-w-6xl mx-auto" : "max-w-full"
            )}>
               {/* Initial Inquiry / Entry */}
               <div className="flex gap-6 max-w-3xl">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-navy-600"><User size={24} /></div>
                  <div className="space-y-4 flex-1">
                     <div className="flex justify-between items-baseline">
                        <div className="space-y-0.5">
                           <h3 className="text-lg font-serif text-white">{selectedThread.name}</h3>
                           <p className="text-[10px] text-gold-500/60 font-medium uppercase tracking-[0.2em]">To: studio@space2standard.com</p>
                        </div>
                        <span className="text-[10px] text-navy-700 font-mono">{format(new Date(selectedThread.created_at), 'MMM dd, yyyy | hh:mm a')}</span>
                     </div>
                     <div className="text-sm font-serif text-navy-200 leading-loose whitespace-pre-wrap py-2 border-l border-white/5 pl-8 italic">
                        {selectedThread.message}
                     </div>
                  </div>
               </div>

               {/* Thread Feed */}
               {threadHistory.map((msg: any) => (
                 <div key={msg.id} className={cn(
                   "flex gap-6 max-w-3xl transition-all animate-in fade-in slide-in-from-left-4 duration-500",
                   msg.type === 'outbound' ? "flex-row-reverse text-right ml-auto" : ""
                 )}>
                    <div className={cn(
                      "w-10 h-10 rounded-2xl border border-white/5 flex items-center justify-center shrink-0",
                      msg.type === 'outbound' ? "bg-gold-500/10" : "bg-white/5"
                    )}>
                      {msg.type === 'outbound' ? <UserCircle size={20} className="text-gold-500" /> : <User size={20} className="text-navy-600" />}
                    </div>
                    <div className="space-y-2 flex-1 min-w-0">
                       <div className={cn(
                         "p-8 border text-sm leading-relaxed font-serif text-left",
                         msg.type === 'outbound' 
                           ? "bg-gold-500/5 border-gold-500/20 rounded-3xl rounded-tr-none text-white shadow-xl" 
                           : "bg-navy-950/40 border-white/5 rounded-3xl rounded-tl-none text-navy-200"
                       )}>
                          {msg.body}
                          {msg.metadata?.document_type && (
                            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-white/10 transition-all">
                               <div className="p-3 bg-gold-500/10 rounded-xl text-gold-500"><FileText size={20} /></div>
                               <div className="flex flex-col">
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-navy-500">Document Dispatch</span>
                                  <span className="text-xs font-serif text-white">{msg.metadata.document_type}</span>
                               </div>
                            </div>
                          )}
                       </div>
                       <span className="text-[10px] text-navy-800 font-mono block mt-1">{format(new Date(msg.created_at), 'MMM dd | hh:mm a')}</span>
                    </div>
                 </div>
               ))}
            </div>

            {/* Premium Compose Bar */}
            <div className="p-10 px-12 bg-black/20 backdrop-blur-md border-t border-white/5">
                <div className="max-w-4xl mx-auto space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500">
                         <Reply size={20} />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-navy-500">Artisan Correspondence</h4>
                   </div>
                   <textarea 
                     ref={replyRef}
                     className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-sm text-white placeholder-navy-800 focus:outline-none focus:bg-white/[0.08] transition-all min-h-[140px] font-serif leading-relaxed"
                     placeholder="Draft your executive response..."
                     value={replyText}
                     onChange={e => setReplyText(e.target.value)}
                   />
                   <div className="flex justify-end pt-2">
                       <button 
                          onClick={() => handleDispatch(false)}
                          disabled={sendingReply || !replyText.trim()}
                          className="btn-dashboard-primary flex items-center gap-4 px-10 h-14 rounded-2xl shadow-gold-500/20 shadow-2xl"
                       >
                          {sendingReply ? <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" /> : <SendIcon size={20} />}
                          <span className="text-[10px] font-black tracking-[0.3em]">{sendingReply ? 'DISPATCHING...' : 'DISPATCH MAIL'}</span>
                       </button>
                   </div>
                </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-20">
             <div className="w-24 h-24 bg-navy-800/10 rounded-full flex items-center justify-center">
                <Mail size={80} strokeWidth={0.5} className="text-navy-600" />
             </div>
             <p className="font-serif italic text-navy-500 text-2xl tracking-tight">Open a thread to reveal the specification.</p>
          </div>
        )}
      </div>

      {/* Compose Modal (Apple Style) */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-navy-950/90 backdrop-blur-2xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="w-full max-w-3xl bg-navy-900/40 border border-white/10 rounded-[40px] p-12 space-y-12 shadow-2xl relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
                
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-gold-500/10 rounded-3xl flex items-center justify-center text-gold-500 shadow-xl"><Plus size={28} /></div>
                      <div>
                         <h2 className="text-3xl font-serif text-white">New Dispatch</h2>
                         <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-navy-500 mt-2">Executive artisan correspondence</p>
                      </div>
                   </div>
                   <button onClick={() => setIsComposeOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-navy-700 hover:text-white transition-all"><X size={24} /></button>
                </div>

                <div className="space-y-8 pt-4">
                   <div className="grid grid-cols-2 gap-8 text-[11px] font-bold uppercase tracking-widest text-navy-600 px-2 lg:grid-cols-2">
                       <div className="space-y-3">
                          <label>To:</label>
                          <input 
                            className="w-full bg-white/5 border-b border-white/10 py-3 text-sm text-white focus:outline-none focus:border-gold-500 transition-all font-serif"
                            placeholder="Recipient Identity..."
                            list="apple-clients"
                            value={composeTo}
                            onChange={e => setComposeTo(e.target.value)}
                          />
                          <datalist id="apple-clients">
                             {clients.map((c: any) => <option key={c.email} value={c.email}>{c.full_name}</option>)}
                          </datalist>
                       </div>
                       <div className="space-y-3">
                          <label>Subject:</label>
                          <input 
                            className="w-full bg-white/5 border-b border-white/10 py-3 text-sm text-white focus:outline-none focus:border-gold-500 transition-all font-serif"
                            placeholder="Artisan Subject Line..."
                            value={composeSubject}
                            onChange={e => setComposeSubject(e.target.value)}
                          />
                       </div>
                   </div>

                   <div className="space-y-3 px-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-navy-600">Correspondence:</label>
                      <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 min-h-[280px] text-base text-white font-serif leading-loose focus:outline-none focus:bg-white/[0.08] transition-all resize-none shadow-inner"
                        placeholder="Begin your artisan specification here..."
                        value={composeBody}
                        onChange={e => setComposeBody(e.target.value)}
                      />
                   </div>
                </div>

                <div className="flex gap-6 pt-6 px-2">
                   <button 
                     onClick={() => setIsComposeOpen(false)}
                     className="flex-1 h-16 rounded-3xl border border-white/5 text-[11px] font-bold tracking-[0.4em] text-navy-700 hover:text-white transition-all uppercase"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={() => handleDispatch(true)}
                     disabled={sendingReply || !composeTo || !composeBody}
                     className="flex-[2] btn-dashboard-primary h-16 rounded-3xl shadow-2xl flex items-center justify-center gap-4"
                   >
                      {sendingReply ? <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" /> : <SendIcon size={24} />}
                      <span className="text-[11px] font-black tracking-[0.4em]">{sendingReply ? 'DISPATCHING...' : 'DISPATCH MAIL'}</span>
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
