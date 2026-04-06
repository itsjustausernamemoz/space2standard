import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Document } from '@shared/types';
import { formatCurrency, formatDate } from '@shared/utils';
import { 
  FileText, 
  Plus, 
  Download, 
  Mail, 
  Search, 
  History,
  FileCheck
} from 'lucide-react';
import { PDFDownloadLink, Document as PDFDoc, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { useNavigate } from 'react-router-dom';

// Register fonts for PDF (Using premium sans-serif)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff', fontWeight: 700 }
  ]
});

// Safari Craft High-Fidelity Styles
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter', backgroundColor: '#ffffff', color: '#1a1a1a', fontSize: 9 },
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

const formatN = (val: number) => `N$ ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// PDF Component
const InvoicePDF = ({ doc, businessInfo, order }: { doc: Document, businessInfo: any, order?: any }) => (
  <PDFDoc>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        {businessInfo.business_logo_url && <Image src={businessInfo.business_logo_url} style={styles.logo} />}
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
        <Text style={styles.termsText}>1. A 50% deposit ({formatN(doc.grand_total * 0.5)}) is required upon acceptance to confirm the order.</Text>
        <Text style={styles.termsText}>2. The remaining balance is due after delivery of the product.</Text>
        <Text style={styles.termsText}>3. Cancellations made less than 5 days after acceptance will forfeit the deposit.</Text>
        <Text style={styles.termsText}>4. All prices are quoted in Namibian Dollars (N$).</Text>
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
  const [businessInfo, setBusinessInfo] = useState({});
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetchData(timeframe);
  }, []);

  async function fetchData(selectedTimeframe = 'all') {
    setLoading(true);

    let query = supabase
      .from('documents')
      .select('*, orders(*)')
      .order('created_at', { ascending: false });

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

    const { data: docs } = await query;
    
    // 2. Fetch business settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*');
    
    const info = settings?.reduce((acc: Record<string, any>, s: any) => ({ ...acc, [s.key]: s.value }), {}) || {};
    
    setDocuments(docs || []);
    setBusinessInfo(info);
    setLoading(false);
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Artisan Ledger</h1>
          <p className="text-navy-400 text-sm italic font-light">Issue and manage professional quotations and invoices.</p>
        </div>
        <button 
          onClick={() => navigate('/invoices/new')}
          className="btn-dashboard-primary flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus size={18} />
          Generate Record
        </button>
      </header>

      {/* Stats and Filter Overlay */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="dashboard-card bg-navy-900 border-navy-800 flex gap-4 items-center">
            <div className="p-3 bg-gold-500/10 text-gold-500 rounded-2xl">
               <FileText size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Total Issued</p>
               <h4 className="text-xl font-bold text-white">{documents.length} Records</h4>
            </div>
         </div>
         <div className="dashboard-card bg-navy-900 border-navy-800 flex flex-col md:flex-row gap-4 items-center col-span-2">
            <div className="flex flex-1 items-center gap-4 w-full">
               <Search size={18} className="text-navy-500 ml-2" />
               <input type="text" placeholder="Search by document ID or client..." className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-navy-600" />
            </div>
            <select 
              className="bg-navy-950 border border-navy-800 text-[10px] font-bold uppercase tracking-widest text-navy-400 rounded px-4 py-2 focus:outline-none focus:border-gold-500 cursor-pointer w-full md:w-auto"
              value={timeframe}
              onChange={(e) => {
                 setTimeframe(e.target.value);
                 fetchData(e.target.value);
              }}
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="30days">Last 30 Days</option>
              <option value="year">This Year</option>
            </select>
         </div>
      </div>

      {/* Docs List */}
      <div className="dashboard-card p-0 overflow-hidden border-navy-800/50">
         <div className="overflow-x-auto shadow-2xl">
           <table className="w-full text-left">
              <thead>
                <tr className="bg-navy-950/50 text-[10px] uppercase font-bold tracking-[0.2em] text-navy-500 border-b border-navy-800">
                  <th className="px-8 py-5">Document</th>
                  <th className="px-8 py-5">Type</th>
                  <th className="px-8 py-5">Client</th>
                  <th className="px-8 py-5">Grand Total</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/50">
                 {documents.map((doc) => (
                   <tr key={doc.id} className="group hover:bg-gold-500/5 transition-colors">
                      <td className="px-8 py-6 font-bold text-cream-100 uppercase tracking-widest text-xs">
                         <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${doc.type === 'invoice' ? 'bg-success/10 text-success' : 'bg-gold-500/10 text-gold-500'}`}>
                               <FileCheck size={14}/>
                            </div>
                            S2S-{doc.id.slice(0, 4).toUpperCase()}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${doc.type === 'invoice' ? 'bg-success/10 text-success' : 'bg-gold-500/10 text-gold-500'}`}>
                            {doc.type}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                           <p className="text-sm font-medium text-white">{doc.orders?.customer_name || 'N/A'}</p>
                           <p className="text-[10px] text-navy-500 font-mono">ID: {doc.order_id?.slice(0,8)}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-white">
                         {formatCurrency(doc.grand_total)}
                      </td>
                      <td className="px-8 py-6 text-xs text-navy-400 font-light">
                         {formatDate(doc.created_at)}
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-3">
                            <PDFDownloadLink 
                              document={<InvoicePDF doc={doc} businessInfo={businessInfo} order={doc.orders} />} 
                              fileName={`${doc.type}_${doc.id.slice(0,8)}.pdf`}
                            >
                               {({ loading: pdfLoading }) => (
                                 <button className="p-2.5 bg-navy-800/50 rounded-xl text-navy-400 hover:text-gold-500 hover:bg-gold-500/10 transition-all" title="Download Document">
                                    {pdfLoading ? <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /> : <Download size={16} />}
                                 </button>
                               )}
                            </PDFDownloadLink>
                            <button className="p-2.5 bg-navy-800/50 rounded-xl text-navy-400 hover:text-accent-light hover:bg-accent-blue/10 transition-all" title="Email to Customer">
                               <Mail size={16} />
                            </button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
         </div>
         {documents.length === 0 && !loading && (
           <div className="p-20 text-center space-y-6">
              <div className="w-20 h-20 bg-navy-950 rounded-full flex items-center justify-center mx-auto border border-navy-800 shadow-inner">
                <History size={32} className="text-navy-700" strokeWidth={1} />
              </div>
              <div className="space-y-2">
                <p className="font-serif italic text-2xl text-navy-500">No records found in the ledger.</p>
                <p className="text-navy-600 text-sm max-w-xs mx-auto">Generate your first premium quotation or invoice to begin tracking your artisan transactions.</p>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};
