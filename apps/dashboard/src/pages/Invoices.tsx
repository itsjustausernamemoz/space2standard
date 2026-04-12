import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Document } from '@shared/types';
import { formatCurrency, formatDate } from '@shared/utils';
import { 
  Edit2,
  CheckCircle,
  CreditCard,
  Plus, 
  Download, 
  Mail, 
  Search, 
  History,
  FileCheck,
  FileText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Share2,
  Send,
  X
} from 'lucide-react';
import { PDFDownloadLink, Document as PDFDoc, Page, Text, View, StyleSheet, Font, Image, pdf } from '@react-pdf/renderer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

// Safari Craft High-Fidelity Styles
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff', color: '#1a1a1a', fontSize: 9 },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 120, height: 60, objectFit: 'contain', marginBottom: 10 },
  studioName: { fontSize: 18, fontWeight: 700, color: '#c19b3a', letterSpacing: 1, textTransform: 'uppercase' },
  studioDetails: { fontSize: 8, color: '#444', marginTop: 4, fontWeight: 700 },
  
  divider: { height: 1, backgroundColor: '#c19b3a', marginVertical: 15, width: '100%' },
  
  docTitle: { fontSize: 22, fontWeight: 700, color: '#c19b3a', textAlign: 'center', textTransform: 'uppercase', marginBottom: 20, letterSpacing: 2 },
  
  metaContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  metaBox: { width: '48%', border: '0.5pt solid #eee' },
  metaRow: { flexDirection: 'row', borderBottom: '0.5pt solid #eee' },
  metaLabel: { width: '40%', padding: 6, backgroundColor: '#fffbeb', fontWeight: 700, borderRight: '0.5pt solid #eee' },
  metaValue: { width: '60%', padding: 6 },
  
  detailsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  detailsBox: { width: '48%', padding: 10, backgroundColor: '#fffbeb', borderRadius: 2 },
  detailsTitle: { fontSize: 8, fontWeight: 700, color: '#c19b3a', textTransform: 'uppercase', marginBottom: 8 },
  detailsText: { marginBottom: 3, lineHeight: 1.4 },
  detailsTextBold: { fontWeight: 700, fontSize: 10, marginTop: 4 },
  
  table: { marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#c19b3a', paddingVertical: 8, paddingHorizontal: 4 },
  tableRow: { flexDirection: 'row', borderBottom: '0.5pt solid #eee', paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center' },
  cellHeader: { color: '#ffffff', fontWeight: 700, fontSize: 8, textTransform: 'uppercase' },
  cell: { fontSize: 8.5 },
  
  colId: { width: '5%', textAlign: 'center' },
  colDesc: { width: '45%' },
  colQty: { width: '8%', textAlign: 'center' },
  colUnit: { width: '12%', textAlign: 'center' },
  colRate: { width: '15%', textAlign: 'right' },
  colAmount: { width: '15%', textAlign: 'right', fontWeight: 700 },
  
  totalContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  totalBox: { width: '40%', border: '1pt solid #c19b3a', flexDirection: 'row' },
  totalLabel: { width: '40%', padding: 8, backgroundColor: '#fffbeb', fontWeight: 700, borderRight: '1pt solid #c19b3a', textAlign: 'right' },
  totalValue: { width: '60%', padding: 8, textAlign: 'right', fontWeight: 700, fontSize: 11 },
  
  sectionTitle: { fontSize: 10, fontWeight: 700, color: '#c19b3a', marginTop: 30, marginBottom: 10, borderBottom: '0.5pt solid #eee', paddingBottom: 4 },
  termsText: { fontSize: 7, color: '#666', lineHeight: 1.6, marginBottom: 2 },
  
  bankTable: { width: '50%', border: '0.5pt solid #eee', marginTop: 5 },
  bankRow: { flexDirection: 'row', borderBottom: '0.5pt solid #eee' },
  bankLabel: { width: '40%', padding: 4, backgroundColor: '#f9f9f9', fontWeight: 700, borderRight: '0.5pt solid #eee' },
  bankValue: { width: '60%', padding: 4 },
  
  authoriseContainer: { marginTop: 40, borderTop: '0.5pt solid #c19b3a', paddingTop: 10, width: '40%' },
  signatureLine: { height: 30, marginBottom: 5 },
  authoriseName: { fontWeight: 700, fontSize: 9 },
  authoriseTitle: { fontSize: 8, color: '#666', marginTop: 2 },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 7, color: '#aaa', borderTop: '0.5pt solid #eee', paddingTop: 10 }
});

const formatN = (val: any) => `N$ ${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// PDF Component
const InvoicePDF = ({ doc, businessInfo, order }: { doc: Document, businessInfo: any, order?: any }) => (
  <PDFDoc>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        {businessInfo.business_logo_url && (
          <Image 
            src={businessInfo.business_logo_url} 
            style={styles.logo} 
          />
        )}
        <Text style={styles.studioName}>{businessInfo.business_name || 'Space2Standard Business'}</Text>
        <Text style={styles.studioDetails}>
          {businessInfo.business_address || 'Windhoek, Namibia'} | {businessInfo.business_email} | {businessInfo.business_phone}
        </Text>
      </View>

      <View style={styles.divider} />
      
      <Text style={styles.docTitle}>{doc.type}</Text>

      {/* Metadata Grid */}
      <View style={styles.metaContainer}>
        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{doc.type} No:</Text>
            <Text style={styles.metaValue}>S2S-{new Date().getFullYear()}-{doc.id.slice(0, 4).toUpperCase()}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Valid Until:</Text>
            <Text style={styles.metaValue}>{formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())}</Text>
          </View>
        </View>
        <View style={styles.metaBox}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date Issued:</Text>
            <Text style={styles.metaValue}>{formatDate(doc.created_at)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Order Date:</Text>
            <Text style={styles.metaValue}>{formatDate(doc.created_at)}</Text>
          </View>
        </View>
      </View>

      {/* Details Boxes */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Bill To</Text>
          <Text style={styles.detailsText}>{order?.customer_name || 'Valued Client'}</Text>
          <Text style={styles.detailsText}>{order?.customer_phone || ''}</Text>
          <Text style={styles.detailsText}>{order?.customer_email || ''}</Text>
          {order?.delivery_address && <Text style={[styles.detailsText, styles.detailsTextBold]}>{order.delivery_address}</Text>}
        </View>
        <View style={styles.detailsBox}>
          <Text style={styles.detailsTitle}>Project Details</Text>
          <Text style={styles.detailsText}>Client: {order?.customer_name || 'Internal'}</Text>
          <Text style={styles.detailsText}>Domain: {businessInfo.business_url || 'www.space2standard.com'}</Text>
          <Text style={styles.detailsText}>Ref ID: #{doc.order_id?.slice(0, 8).toUpperCase() || 'N/A'}</Text>
        </View>
      </View>

      {/* Line Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.cellHeader, styles.colId]}>#</Text>
          <Text style={[styles.cellHeader, styles.colDesc]}>Description of Product</Text>
          <Text style={[styles.cellHeader, styles.colQty]}>Qty</Text>
          <Text style={[styles.cellHeader, styles.colUnit]}>Unit</Text>
          <Text style={[styles.cellHeader, styles.colRate]}>Unit Rate</Text>
          <Text style={[styles.cellHeader, styles.colAmount]}>Amount (N$)</Text>
        </View>
        {(doc.line_items || []).map((item: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.cell, styles.colId]}>{i + 1}</Text>
            <Text style={[styles.cell, styles.colDesc]}>{item.product_name}</Text>
            <Text style={[styles.cell, styles.colQty]}>{item.quantity}</Text>
            <Text style={[styles.cell, styles.colUnit]}>{item.unit || 'Piece'}</Text>
            <Text style={[styles.cell, styles.colRate]}>{formatN(item.unit_price)}</Text>
            <Text style={[styles.cell, styles.colAmount]}>{formatN(item.total)}</Text>
          </View>
        ))}
      </View>

      {/* Totals Box */}
      <View style={styles.totalContainer}>
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{formatN(doc.grand_total)}</Text>
        </View>
      </View>

      {/* Footer Info */}
      <Text style={styles.sectionTitle}>Terms & Conditions</Text>
      <View>
        {(doc.payment_terms || 'Payment is due within 7 days of invoice date.').split('\n').map((line: string, i: number) => (
          <Text key={i} style={styles.termsText}>{line}</Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Banking Details</Text>
      <View style={styles.bankTable}>
        <View style={styles.bankRow}>
          <Text style={styles.bankLabel}>Bank:</Text>
          <Text style={styles.bankValue}>{businessInfo.bank_name || 'N/A'}</Text>
        </View>
        <View style={styles.bankRow}>
          <Text style={styles.bankLabel}>Account Name:</Text>
          <Text style={styles.bankValue}>{businessInfo.bank_account_name || 'N/A'}</Text>
        </View>
        <View style={styles.bankRow}>
          <Text style={styles.bankLabel}>Account No:</Text>
          <Text style={styles.bankValue}>{businessInfo.bank_account_number || 'N/A'}</Text>
        </View>
        <View style={styles.bankRow}>
          <Text style={styles.bankLabel}>Branch Code:</Text>
          <Text style={styles.bankValue}>{businessInfo.bank_branch_code || 'N/A'}</Text>
        </View>
        <View style={styles.bankRow}>
          <Text style={styles.bankLabel}>Reference:</Text>
          <Text style={styles.bankValue}>{businessInfo.bank_reference || 'S2S-' + doc.id.slice(0,4)}</Text>
        </View>
      </View>

      {/* Authorisation */}
      <View style={styles.sectionTitle}>Authorised By</View>
      <View style={styles.authoriseContainer}>
        <View style={styles.signatureLine} />
        <Text style={styles.authoriseName}>{businessInfo.authorised_by_name || 'Business Principal'}</Text>
        <Text style={styles.authoriseTitle}>{businessInfo.authorised_by_title || 'Managing Director'}</Text>
        <Text style={styles.authoriseTitle}>{businessInfo.business_name || 'Space2Standard Business'}</Text>
        <Text style={styles.authoriseTitle}>Date: {formatDate(doc.created_at)}</Text>
      </View>

      <Text style={styles.footer}>
        Thank you for choosing {businessInfo.business_name || 'Space2Standard Business'}. We look forward to working with you.
      </Text>
    </Page>
  </PDFDoc>
);
export const Invoices = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState<any>({});
  const [timeframe, setTimeframe] = useState('all');
  const [activeTab, setActiveTab] = useState<'invoice' | 'quotation'>('invoice');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [sharingDoc, setSharingDoc] = useState<any>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareNotes, setShareNotes] = useState('');
  const [confirmingPaidDoc, setConfirmingPaidDoc] = useState<any>(null);
  const itemsPerPage = 6;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(0, searchTerm, activeTab, timeframe);
      setCurrentPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, activeTab, timeframe]);

  async function fetchData(page: number, search: string, tab: string, selectedTimeframe = 'all') {
    setLoading(true);
    const from = page * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
      .from('documents')
      .select('*, orders(*), clients(*)', { count: 'exact' });

    // Server-side filtering by tab type
    query = query.eq('type', tab);

    if (search) {
       // Search in document id or associated order customer name
       query = query.or(`id.ilike.%${search}%, orders.customer_name.ilike.%${search}%`);
    }

    if (selectedTimeframe !== 'all') {
      const now = new Date();
      let startDate;
      if (selectedTimeframe === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (selectedTimeframe === '30days') {
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      } else if (selectedTimeframe === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
    }

    const { data: docs, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data: settings } = await supabase.from('settings').select('*');
    const info = settings?.reduce((acc: Record<string, any>, s: any) => ({ ...acc, [s.key]: s.value }), {}) || {};
    
    if (error) {
      toast.error('Failed to reconcile the ledger');
    } else {
      setDocuments(docs || []);
      setTotalItems(count || 0);
    }
    setBusinessInfo(info);
    setLoading(false);
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchData(newPage, searchTerm, activeTab, timeframe);
  };

  const handleMarkAsPaid = async () => {
    const doc = confirmingPaidDoc;
    if (!doc) return;
    
    setConfirmingPaidDoc(null);
    setLoading(true);
    try {
      // 1. Update Document Status
      const { error: docError } = await supabase
        .from('documents')
        .update({ is_paid: true })
        .eq('id', doc.id);
      if (docError) throw docError;

      // 2. Update Order Status
      if (doc.order_id) {
        await supabase.from('orders').update({ status: 'completed' }).eq('id', doc.order_id);
      }

      // 3. Inventory Deduction Transactional-style
      const items = doc.line_items || [];
      for (const item of items) {
        if (item.product_id) {
          const { data: prod } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();
          
          if (prod) {
            const newQty = Math.max(0, (prod.stock_quantity || 0) - (item.quantity || 0));
            await supabase.from('products').update({ stock_quantity: newQty }).eq('id', item.product_id);
          }
        }
      }

      toast.success('Artisan Ledger reconciled. Payment tracked and stock adjusted.');
      fetchData(currentPage, searchTerm, activeTab, timeframe);
    } catch (err: any) {
      toast.error(`Reconciliation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!sharingDoc) return;
    setIsSharing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user?.id).single();
      const { data: { session } } = await supabase.auth.getSession();

      // 1. Generate PDF Blob on-the-fly (with safety wrap)
      let pdfBlob;
      try {
        pdfBlob = await pdf(<InvoicePDF doc={sharingDoc} businessInfo={businessInfo} order={sharingDoc.orders} />).toBlob();
      } catch (err) {
        console.error('PDF Generation Error:', err);
        throw new Error('Artisan ledger generation failed. Please check logo format or try again.');
      }
      
      // 2. Upload to private communications bucket
      const fileName = `${sharingDoc.type}_${sharingDoc.id}_${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('communications')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) throw new Error(`Document upload failed: ${uploadError.message}`);

      // 3. Dispatch Email with attachmentPath
      const recipientEmail = sharingDoc.orders?.customer_email || sharingDoc.clients?.email;
      const recipientName = sharingDoc.orders?.customer_name || sharingDoc.clients?.full_name;

      if (!recipientEmail) throw new Error('Recipient identity is missing from the ledger record.');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          to: recipientEmail,
          recipientName: recipientName,
          subject: `${sharingDoc.type === 'invoice' ? 'Tax Invoice' : 'Project Quotation'} from ${businessInfo.business_name || 'Space2Standard'}`,
          message: shareNotes || `Please find your ${sharingDoc.type} attached for your bespoke project.`,
          adminName: profile?.full_name || 'Admin',
          attachmentPath: fileName,
          documentType: sharingDoc.type === 'invoice' ? 'Tax Invoice' : 'Project Quotation'
        })
      });

      if (!response.ok) throw new Error('Failed to dispatch document email');

      // 4. Log Communication
      await supabase.from('communication_logs').insert({
        client_id: sharingDoc.client_id,
        type: 'outbound',
        sender_name: profile?.full_name || 'Admin',
        sender_email: 'studio@space2standard.com',
        recipient_email: recipientEmail,
        subject: `${sharingDoc.type.toUpperCase()} SHARED: ${sharingDoc.id.slice(0,8)}`,
        body: shareNotes || `Document shared via Artisan Ledger.`,
        metadata: { document_id: sharingDoc.id, document_type: sharingDoc.type },
        admin_id: user?.id
      });

      toast.success('Document shared with client.');
      setSharingDoc(null);
      setShareNotes('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Artisan Ledger</h1>
          <p className="text-navy-500 text-sm font-light italic">Maintaining financial records of bespoke craftsmanship.</p>
        </div>
        <button 
          onClick={() => navigate(`/invoices/new?type=${activeTab}`)}
          className="btn-dashboard-primary flex items-center justify-center gap-3 w-full md:w-auto"
        >
          <Plus size={18} />
          Issue New {activeTab === 'invoice' ? 'Invoice' : 'Quotation'}
        </button>
      </header>

      {/* Navigation and Filters */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
         <div className="flex bg-white/5 p-1 rounded-[6px] w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('invoice')}
              className={cn(
                "flex-1 md:flex-none px-8 py-2.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'invoice' ? "bg-gold-500 text-navy-950 shadow-md" : "text-navy-500 hover:text-white"
              )}
            >
               Tax Invoices
            </button>
            <button 
              onClick={() => setActiveTab('quotation')}
              className={cn(
                "flex-1 md:flex-none px-8 py-2.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'quotation' ? "bg-gold-500 text-navy-950 shadow-md" : "text-navy-500 hover:text-white"
              )}
            >
               Project Quotations
            </button>
         </div>

         <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-600" />
               <input 
                 type="text" 
                 placeholder="Search ref or client..." 
                 className="input-base pl-12 py-2.5" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <select 
              className="input-base py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/40 w-full md:w-32"
              value={timeframe}
              onChange={(e) => {
                 setTimeframe(e.target.value);
                 // fetchData handled by useEffect
              }}
            >
              <option value="all">All Time</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
         </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 gap-4">
         {loading ? (
            [1,2,3].map(i => <div key={i} className="h-24 bg-navy-900/40 animate-pulse rounded-[6px]" />)
         ) : documents.length > 0 ? (
            documents.map((doc) => (
               <div key={doc.id} className="dashboard-card py-6 px-8 group hover:border-gold-500/10 transition-all">
                  <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                     <div className="flex items-center gap-6 flex-1">
                        <div className={cn(
                           "p-3 rounded-[4px]",
                           doc.type === 'invoice' ? "bg-success/5 text-success/60" : "bg-gold-500/10 text-gold-500"
                        )}>
                           <FileCheck size={20} />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-600 leading-none">
                              {doc.orders?.order_number || `S2S-${doc.id.slice(0, 4).toUpperCase()}`}
                           </p>
                           <h3 className="text-lg font-serif text-white">{doc.orders?.customer_name || 'Individual Client'}</h3>
                        </div>
                     </div>

                     <div className="flex flex-wrap gap-12 text-[10px] font-bold uppercase tracking-widest text-navy-500">
                        <div className="space-y-1">
                           <p className="text-navy-700">Issued On</p>
                           <p className="text-white/80">{formatDate(doc.created_at)}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-navy-700">Total Value</p>
                           <p className="text-white text-base">{formatCurrency(doc.grand_total)}</p>
                        </div>
                     </div>

                        <div className="flex gap-2 w-full lg:w-auto">
                           {doc.type === 'invoice' && !doc.is_paid && (
                              <button 
                                onClick={() => setConfirmingPaidDoc(doc)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-success/10 hover:bg-success/20 border border-success/20 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.2em] text-success transition-all"
                              >
                                 <CreditCard size={14} /> Mark Paid
                              </button>
                           )}
                           
                           {doc.is_paid && (
                              <div className="flex items-center gap-2 px-4 py-2.5 bg-success/10 border border-success/20 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.2em] text-success">
                                 <CheckCircle size={14} /> Paid
                              </div>
                           )}

                           {doc.type === 'quotation' && (
                              <button 
                                onClick={() => navigate(`/invoices/new?type=invoice&orderId=${doc.order_id}&fromQuote=${doc.id}`)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-success/10 hover:bg-success/20 border border-success/20 rounded-[4px] text-[9px] font-bold uppercase tracking-[0.2em] text-success transition-all"
                              >
                                 <ShieldCheck size={14} /> Issue Invoice
                              </button>
                           )}

                           <PDFDownloadLink 
                             document={<InvoicePDF doc={doc} businessInfo={businessInfo} order={doc.orders} />} 
                             fileName={`${doc.type}_${doc.id.slice(0,8)}.pdf`}
                             className="flex-1 lg:flex-none"
                           >
                              {({ loading: pdfLoading }) => (
                                <button className="w-full flex items-center justify-center p-3 bg-white/5 rounded-[4px] text-white/40 hover:text-white transition-all">
                                   {pdfLoading ? <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /> : <Download size={18} />}
                                </button>
                              )}
                           </PDFDownloadLink>

                           <button 
                             onClick={() => {
                               setSharingDoc(doc);
                               setShareNotes(`Dear ${doc.orders?.customer_name || 'Valued Client'},\n\nPlease find your ${doc.type} attached for your bespoke project. We look forward to proceeding.`);
                             }}
                             className="flex-1 lg:flex-none p-3 bg-gold-500/5 rounded-[4px] text-gold-500/40 hover:text-gold-500 transition-all"
                           >
                              <Mail size={18} />
                           </button>

                           <button 
                             onClick={() => navigate(`/invoices/${doc.id}/edit`)}
                             className="flex-1 lg:flex-none p-3 bg-white/5 rounded-[4px] text-white/40 hover:text-gold-500 transition-all"
                           >
                              <Edit2 size={18} />
                           </button>
                        </div>
                  </div>
               </div>
            ))
         ) : (
            <div className="py-40 flex flex-col items-center justify-center space-y-6">
               <History size={64} className="text-navy-900" strokeWidth={0.5} />
               <div className="text-center space-y-2">
                  <p className="font-serif italic text-2xl text-navy-600">No {activeTab}s Issued Yet</p>
                  <p className="text-navy-700 text-xs max-w-sm">Generating premium financial records ensures your artisan business remains meticulously organised and professional.</p>
               </div>
            </div>
         )}
      </div>

      {/* Pagination */}
      {totalItems > itemsPerPage && (
        <div className="flex justify-between items-center bg-white/[0.02] border border-[#ffffff0a] px-8 py-3 rounded-[6px] text-[10px] font-bold uppercase tracking-widest text-navy-600">
           <span>Ledger page {currentPage + 1} of {Math.ceil(totalItems / itemsPerPage)} ({totalItems} records)</span>
           <div className="flex gap-6">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0 || loading}
                className="flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-colors"
              >
                <ChevronLeft size={14}/> Previous
              </button>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={(currentPage + 1) * itemsPerPage >= totalItems || loading}
                className="flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-colors"
              >
                Next <ChevronRight size={14}/>
              </button>
           </div>
        </div>
      )}

      {/* Share Modal */}
      {sharingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="dashboard-card w-full max-w-lg space-y-8 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-gold-500/10 rounded-[4px] text-gold-500">
                       <Share2 size={20} />
                    </div>
                    <div>
                       <h3 className="text-xl font-serif text-white">Share Document</h3>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-navy-500 mt-1">Direct to {sharingDoc.orders?.customer_email}</p>
                    </div>
                 </div>
                 <button onClick={() => setSharingDoc(null)} className="text-navy-600 hover:text-white transition-colors"><X size={20}/></button>
              </div>

              <div className="space-y-4">
                 <div className="p-4 bg-white/5 rounded-[4px] border border-white/5 flex items-center gap-4">
                    <FileText size={16} className="text-gold-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-navy-400">Attached: {sharingDoc.type.toUpperCase()} S2S-{sharingDoc.id.slice(0,4)}</span>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-600">Message to Client</label>
                    <textarea 
                      className="input-base min-h-[150px] resize-none py-4"
                      placeholder="Enter a message for the client..."
                      value={shareNotes}
                      onChange={e => setShareNotes(e.target.value)}
                    />
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button 
                   onClick={() => setSharingDoc(null)}
                   className="flex-1 px-8 py-3 rounded-[4px] text-[10px] font-bold uppercase tracking-widest text-navy-500 hover:text-white transition-colors border border-white/5"
                 >
                    Cancel
                 </button>
                 <button 
                   onClick={handleShare}
                   disabled={isSharing}
                   className="flex-1 btn-dashboard-primary flex items-center justify-center gap-3 h-12"
                 >
                    {isSharing ? <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" /> : <Send size={16} />}
                    {isSharing ? 'DISPATCHING...' : 'DISPATCH DOCUMENT'}
                 </button>
              </div>
           </div>
        </div>
      )}
      {/* Reconciliation Confirmation Modal */}
      {confirmingPaidDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-navy-950/40 backdrop-blur-md animate-in fade-in duration-300">
           <div className="dashboard-card w-full max-w-sm space-y-8 animate-in zoom-in-95 duration-300 border-gold-500/20 shadow-2xl shadow-gold-500/5">
              <div className="flex flex-col items-center text-center space-y-4">
                 <div className="p-4 bg-gold-500/10 rounded-full text-gold-500 mb-2">
                    <ShieldCheck size={32} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-serif text-white">Reconcile Ledger?</h3>
                    <p className="text-[11px] text-navy-400 leading-relaxed px-4">
                       Marking <span className="text-gold-400 font-bold uppercase tracking-tighter">S2S-{confirmingPaidDoc.id.slice(0,4)}</span> as paid will automatically close the linked project and adjust artisanal inventory.
                    </p>
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <button 
                   onClick={handleMarkAsPaid}
                   className="w-full btn-dashboard-primary h-12 text-[10px] font-bold uppercase tracking-[0.2em]"
                 >
                    Confirm Ledger Payment
                 </button>
                 <button 
                   onClick={() => setConfirmingPaidDoc(null)}
                   className="w-full h-12 text-[10px] font-bold uppercase tracking-[0.2em] text-navy-600 hover:text-white transition-colors"
                 >
                    Cancel
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
