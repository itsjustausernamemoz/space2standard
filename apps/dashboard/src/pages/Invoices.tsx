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
import { PDFDownloadLink, Document as PDFDoc, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts for PDF
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_EeA.woff', fontWeight: 700 }
  ]
});

// PDF Styles
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter', backgroundColor: '#ffffff', color: '#1a1a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, borderBottomWidth: 1, borderBottomColor: '#f1f1f1', paddingBottom: 20 },
  logo: { fontSize: 24, fontWeight: 700, letterSpacing: -1 },
  documentInfo: { textAlign: 'right' },
  docType: { fontSize: 20, fontWeight: 700, textTransform: 'uppercase', color: '#c9a84c', marginBottom: 4 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#888', marginBottom: 10, letterSpacing: 1 },
  row: { flexDirection: 'row', marginBottom: 15 },
  label: { width: 100, fontSize: 10, fontWeight: 700, color: '#888' },
  value: { flex: 1, fontSize: 10 },
  table: { marginTop: 20 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#fafafa', padding: 8, borderBottomWidth: 1, borderBottomColor: '#eeeeee' },
  tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  cellHeader: { fontSize: 9, fontWeight: 700, color: '#888', textTransform: 'uppercase' },
  cell: { fontSize: 9 },
  colDesc: { flex: 3 },
  colQty: { flex: 0.5, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right' },
  totalsArea: { marginTop: 30, paddingLeft: 300 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  grandTotal: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eeeeee', fontSize: 14, fontWeight: 700, color: '#c9a84c' },
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, textAlign: 'center', borderTopWidth: 1, borderTopColor: '#f1f1f1', paddingTop: 20, fontSize: 8, color: '#888' }
});

// PDF Component
const InvoicePDF = ({ doc, businessInfo }: { doc: Document, businessInfo: any }) => (
  <PDFDoc>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.logo}>Space2Standard</Text>
        <View style={styles.documentInfo}>
          <Text style={styles.docType}>{doc.type}</Text>
          <Text style={styles.value}>#{doc.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.value}>{formatDate(doc.created_at)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '45%' }}>
            <Text style={styles.sectionTitle}>From</Text>
            <Text style={styles.value}>{businessInfo.business_name || 'Space2Standard Carpentry'}</Text>
            <Text style={styles.value}>{businessInfo.business_address || '123 Artisan Way, Craftville'}</Text>
            <Text style={styles.value}>{businessInfo.business_email || 'hello@space2standard.com'}</Text>
          </View>
          <View style={{ width: '45%' }}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.value}>Inquiry Ref: {doc.order_id?.slice(0, 8)}</Text>
            <Text style={styles.value}>Client Details On Record</Text>
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.cellHeader, styles.colDesc]}>Description</Text>
          <Text style={[styles.cellHeader, styles.colQty]}>Qty</Text>
          <Text style={[styles.cellHeader, styles.colPrice]}>Unit Price</Text>
          <Text style={[styles.cellHeader, styles.colTotal]}>Total</Text>
        </View>
        {(doc.line_items || []).map((item: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.cell, styles.colDesc]}>{item.product_name}</Text>
            <Text style={[styles.cell, styles.colQty]}>{item.quantity}</Text>
            <Text style={[styles.cell, styles.colPrice]}>{formatCurrency(item.unit_price)}</Text>
            <Text style={[styles.cell, styles.colTotal]}>{formatCurrency(item.total)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalsArea}>
        <View style={styles.totalRow}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.cell}>{formatCurrency(doc.subtotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.label}>VAT ({doc.vat_rate}%)</Text>
          <Text style={styles.cell}>{formatCurrency(doc.vat_amount)}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={{ fontWeight: 700 }}>Total Due</Text>
          <Text style={{ fontWeight: 700 }}>{formatCurrency(doc.grand_total)}</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        Space2Standard Carpentry &bull; 123 Artisan Way, Craftville &bull; Registered in South Africa
      </Text>
    </Page>
  </PDFDoc>
);

export const Invoices = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // 1. Fetch documents
    const { data: docs } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
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
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-white tracking-tight">Financial Records</h1>
          <p className="text-charcoal-500 text-sm">Issue and manage professional quotations and invoices.</p>
        </div>
        <button className="btn-dashboard-primary flex items-center gap-2">
          <Plus size={18} />
          Create Document
        </button>
      </header>

      {/* Stats and Filter Overlay */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="dashboard-card bg-charcoal-900 border-charcoal-800 flex gap-4 items-center">
            <div className="p-3 bg-gold-500/10 text-gold-500 rounded-xl">
               <FileText size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-500">Issued</p>
               <h4 className="text-xl font-bold text-white">{documents.length} Total</h4>
            </div>
         </div>
         <div className="dashboard-card bg-charcoal-900 border-charcoal-800 flex gap-4 items-center col-span-2">
            <Search size={18} className="text-charcoal-500 ml-2" />
            <input type="text" placeholder="Search by document ID or client..." className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-charcoal-600" />
         </div>
      </div>

      {/* Docs List */}
      <div className="dashboard-card p-0 overflow-hidden border-none">
         <table className="w-full text-left">
            <thead>
              <tr className="bg-charcoal-950/50 text-[10px] uppercase font-bold tracking-[0.2em] text-charcoal-500 border-b border-charcoal-800">
                <th className="px-8 py-5">Document</th>
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5">Order Ref</th>
                <th className="px-8 py-5">Grand Total</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
               {documents.map((doc) => (
                 <tr key={doc.id} className="group hover:bg-charcoal-800/30">
                    <td className="px-8 py-6 font-bold text-cream-100 uppercase tracking-widest text-xs">
                       <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded ${doc.type === 'invoice' ? 'bg-success/10 text-success' : 'bg-gold-500/10 text-gold-500'}`}>
                             <FileCheck size={14}/>
                          </div>
                          #{doc.id.slice(0, 8)}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${doc.type === 'invoice' ? 'text-success' : 'text-gold-500'}`}>
                          {doc.type}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-xs text-charcoal-500">
                       {doc.order_id ? `#${doc.order_id.slice(0,8)}` : 'N/A'}
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-white">
                       {formatCurrency(doc.grand_total)}
                    </td>
                    <td className="px-8 py-6 text-xs text-charcoal-500">
                       {formatDate(doc.created_at)}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-4">
                          <PDFDownloadLink document={<InvoicePDF doc={doc} businessInfo={businessInfo} />} fileName={`${doc.type}_${doc.id.slice(0,8)}.pdf`}>
                             {({ loading: pdfLoading }) => (
                               <button className="p-2 text-charcoal-500 hover:text-white transition-colors" title="Download PDF">
                                  {pdfLoading ? '...' : <Download size={16} />}
                               </button>
                             )}
                          </PDFDownloadLink>
                          <button className="p-2 text-charcoal-500 hover:text-white transition-colors" title="Email to Customer">
                             <Mail size={16} />
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
         {documents.length === 0 && !loading && (
           <div className="p-20 text-center space-y-4">
              <History size={48} className="mx-auto text-charcoal-800" strokeWidth={1} />
              <p className="font-serif italic text-xl text-charcoal-500">No documents issued yet.</p>
           </div>
         )}
      </div>
    </div>
  );
};
