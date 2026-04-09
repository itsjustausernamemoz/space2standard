import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  User, 
  MoreHorizontal,
  Reply,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const Messages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Messages fetch error:', error);
      toast.error('Could not load inquiries. Ensure database migration is complete.');
      setMessages([]);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  }

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: 'read' })
      .eq('id', id);

    if (!error) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    
    try {
      // 1. Call Edge Function to send email
      const { data, error: functionError } = await supabase.functions.invoke('send-reply', {
        body: {
          to: selectedMessage.email,
          subject: `Re: ${selectedMessage.subject || 'Your Inquiry'}`,
          message: replyText,
          originalMessage: selectedMessage.message
        }
      });

      if (functionError) throw functionError;

      // 2. Update status in database
      const { error: dbError } = await supabase
        .from('contact_messages')
        .update({ status: 'replied' })
        .eq('id', selectedMessage.id);

      if (dbError) throw dbError;

      toast.success('Reply sent successfully via Namecheap SMTP.');
      setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, status: 'replied' } : m));
      setReplyText('');
      setSelectedMessage(null);
    } catch (error: any) {
      console.error('Reply failed:', error);
      toast.error('Failed to send reply. Check Edge Function logs.');
    } finally {
      setSendingReply(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Message removed.');
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'new': return <AlertCircle className="text-gold-500" size={14} />;
      case 'read': return <Clock className="text-navy-500" size={14} />;
      case 'replied': return <CheckCircle2 className="text-success" size={14} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Artisan Inquiries</h1>
          <p className="text-navy-500 text-sm italic">Direct conversations from your storefront artisans.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-600" size={16} />
            <input 
              className="input-base pl-10" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="input-base w-40"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Inquiries</option>
            <option value="new">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* List View */}
        <div className={cn(
          "dashboard-card p-0 overflow-hidden",
          selectedMessage ? "lg:col-span-4 hidden lg:block" : "lg:col-span-12"
        )}>
          {loading ? (
             <div className="p-20 flex justify-center"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-20 text-center space-y-4 opacity-50">
               <Mail size={40} className="mx-auto text-navy-800" />
               <p className="font-serif italic text-navy-400">Silence in the atelier. No inquiries found.</p>
            </div>
          ) : (
            <div className="divide-y divide-navy-800">
               {filteredMessages.map((msg) => (
                 <div 
                    key={msg.id}
                    onClick={() => {
                        setSelectedMessage(msg);
                        if (msg.status === 'new') markAsRead(msg.id);
                    }}
                    className={cn(
                        "p-6 cursor-pointer hover:bg-navy-800/50 transition-all flex gap-4 group",
                        selectedMessage?.id === msg.id ? "bg-navy-800 border-l-2 border-gold-500" : "bg-transparent",
                        msg.status === 'new' && "bg-gold-500/5"
                    )}
                 >
                    <div className="w-10 h-10 rounded-full bg-navy-950 border border-navy-800 flex items-center justify-center shrink-0 group-hover:bg-gold-500/10 transition-colors">
                       <User size={18} className="text-navy-500" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                       <div className="flex justify-between items-start">
                          <h4 className={cn("text-xs font-bold uppercase tracking-widest truncate", msg.status === 'new' ? "text-white" : "text-navy-400")}>
                             {msg.name}
                          </h4>
                          <span className="text-[10px] text-navy-600 font-mono italic">
                             {format(new Date(msg.created_at), 'MMM dd')}
                          </span>
                       </div>
                       <p className="text-sm font-serif text-navy-300 truncate">{msg.subject || 'No Subject'}</p>
                       <div className="flex items-center gap-2">
                          {getStatusIcon(msg.status)}
                          <span className="text-[10px] uppercase font-bold tracking-tighter text-navy-600">{msg.status}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Detail View */}
        {selectedMessage && (
           <div className="lg:col-span-8 space-y-8 animate-in slide-in-from-right-10 duration-500">
              <div className="dashboard-card space-y-10 relative">
                 <button 
                    onClick={() => setSelectedMessage(null)}
                    className="absolute top-6 right-6 p-2 text-navy-600 hover:text-white transition-colors"
                 >
                    <X size={20} />
                 </button>

                 <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 border border-gold-500/10">
                       <Mail size={32} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-serif text-white tracking-wide">{selectedMessage.subject || 'Artisan Inquiry'}</h2>
                       <p className="text-sm text-gold-500/70 font-bold uppercase tracking-widest mt-1">From: {selectedMessage.name} &lt;{selectedMessage.email}&gt;</p>
                    </div>
                 </div>

                 <div className="p-8 bg-navy-950 border border-navy-800 rounded-2xl italic text-navy-300 leading-relaxed font-serif whitespace-pre-wrap min-h-[200px]">
                    {selectedMessage.message}
                 </div>

                 <div className="gold-divider" />

                 {/* Reply Area */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <Reply size={18} className="text-gold-500" />
                       <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white">Direct Response via Namecheap</h3>
                    </div>
                    
                    <textarea 
                       className="input-base min-h-[150px] resize-none"
                       placeholder="Draft your exquisite response..."
                       value={replyText}
                       onChange={e => setReplyText(e.target.value)}
                    />

                    <div className="flex justify-between items-center">
                       <button 
                          onClick={() => deleteMessage(selectedMessage.id)}
                          className="flex items-center gap-2 px-4 py-2 text-error/60 hover:text-error transition-all text-xs font-bold uppercase tracking-widest"
                       >
                          <Trash2 size={14} /> Delete Thread
                       </button>
                       <button 
                          onClick={handleReply}
                          disabled={sendingReply || !replyText.trim()}
                          className="btn-dashboard-primary flex items-center gap-3"
                       >
                          {sendingReply ? <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" /> : <Send size={18} />}
                          {sendingReply ? 'Sending Artisan Response...' : 'Send Excellence Response'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* Thread History Placeholder */}
              <div className="p-6 bg-navy-900 border border-navy-800 rounded-2xl flex items-center gap-4 opacity-50 grayscale">
                 <div className="p-2 bg-navy-800 rounded-lg text-gold-500">
                    <Clock size={16} />
                 </div>
                 <p className="text-xs font-bold uppercase tracking-widest text-navy-500">Thread started {format(new Date(selectedMessage.created_at), 'MMMM do, yyyy @ HH:mm')}</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};
