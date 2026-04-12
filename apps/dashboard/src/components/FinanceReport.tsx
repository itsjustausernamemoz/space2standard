import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { formatCurrency, formatDate } from '@shared/utils';

// Standard system fonts for stability
const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica', color: '#1a1a1a', fontSize: 9 },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 120, height: 60, objectFit: 'contain', marginBottom: 10 },
  studioName: { fontSize: 18, fontWeight: 700, color: '#c19b3a', letterSpacing: 1, textTransform: 'uppercase' },
  studioDetails: { fontSize: 8, color: '#444', marginTop: 4, fontWeight: 700 },
  divider: { height: 1, backgroundColor: '#c19b3a', marginVertical: 15, width: '100%' },
  
  docTitle: { fontSize: 20, fontWeight: 700, color: '#c19b3a', textAlign: 'center', textTransform: 'uppercase', marginBottom: 20, letterSpacing: 2 },
  
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 10, fontWeight: 700, color: '#c19b3a', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eeeeee', paddingBottom: 4 },
  
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 15 },
  kpiBox: { width: '47%', padding: 12, backgroundColor: '#fffbeb', borderRadius: 4, marginBottom: 8 },
  
  tableHeader: { flexDirection: 'row', backgroundColor: '#c19b3a', paddingVertical: 8, paddingHorizontal: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f5f5f5', paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center' },
  cellHeader: { color: '#ffffff', fontWeight: 700, fontSize: 8, textTransform: 'uppercase' },
  
  colName: { width: '50%', fontSize: 9 },
  colStock: { width: '25%', fontSize: 9, textAlign: 'center' },
  colVal: { width: '25%', fontSize: 9, textAlign: 'right', fontWeight: 700 },

  orderColId: { width: '15%', fontSize: 8, color: '#888' },
  orderColDate: { width: '15%', fontSize: 8 },
  orderColClient: { width: '35%', fontSize: 8, fontWeight: 700 },
  orderColStatus: { width: '15%', fontSize: 8, textAlign: 'center' },
  orderColTotal: { width: '20%', fontSize: 8, textAlign: 'right', fontWeight: 700 },

  ledgerRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingVertical: 8, alignItems: 'center' },
  refCol: { width: '15%', fontSize: 8, color: '#888', fontWeight: 700 },
  dateCol: { width: '15%', fontSize: 8 },
  clientCol: { width: '35%', fontSize: 8, fontWeight: 700 },
  typeCol: { width: '15%', fontSize: 8, textAlign: 'center' },
  statusCol: { width: '10%', fontSize: 7, textAlign: 'center' },
  amountCol: { width: '10%', fontSize: 8, textAlign: 'right', fontWeight: 700 },

  subtitle: { fontSize: 9, color: '#666', textTransform: 'uppercase' },
  value: { fontSize: 9, fontWeight: 700 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 7, color: '#aaa', borderTop: '0.5pt solid #eee', paddingTop: 10 },
  footerText: { marginBottom: 3 },
  badge: { fontSize: 7, fontWeight: 700, color: '#c19b3a', textTransform: 'uppercase' }
});

interface ReportProps {
  stats: {
    totalRevenue: number;
    inventoryValue: number;
    ordersCount: { new: number; pending: number; completed: number };
    topProducts: any[];
    topClients: any[];
  };
  timeframe: string;
  recentActivity?: any[];
  detailedLedger?: any[];
  inventoryList?: any[];
  allOrdersList?: any[];
  businessInfo?: any;
}

export const FinanceReport: React.FC<ReportProps> = ({ 
  stats, 
  timeframe, 
  recentActivity, 
  detailedLedger,
  inventoryList,
  allOrdersList,
  businessInfo 
}) => (
  <Document title="Artisan Executive Ledger">
    <Page size="A4" style={styles.page}>
      {/* Synchronized Branded Header */}
      <View style={styles.header}>
        {businessInfo?.business_logo_url && (
          <Image src={businessInfo.business_logo_url} style={styles.logo} />
        )}
        <Text style={styles.studioName}>{businessInfo?.business_name || 'Artisan Business'}</Text>
        <Text style={styles.studioDetails}>
          {businessInfo?.business_address || ''} | {businessInfo?.business_email} | {businessInfo?.business_phone}
        </Text>
        {businessInfo?.business_url && <Text style={styles.studioDetails}>{businessInfo.business_url}</Text>}
      </View>

      <View style={styles.divider} />
      <Text style={styles.docTitle}>Executive Master Ledger</Text>
      <Text style={{ textAlign: 'center', fontSize: 9, color: '#666', marginBottom: 20 }}>Reporting Cycle: {timeframe}</Text>

      {/* Financial Nucleus */}
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>Financial performance nucleus</Text>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiBox}>
             <Text style={styles.subtitle}>Gross Realised Revenue</Text>
             <Text style={[styles.value, {fontSize: 14, marginTop: 4, color: '#000000'}]}>{formatCurrency(stats.totalRevenue)}</Text>
          </View>
          <View style={styles.kpiBox}>
             <Text style={styles.subtitle}>VAT Liability (15%)</Text>
             <Text style={[styles.value, {fontSize: 14, marginTop: 4}]}>{formatCurrency(stats.totalRevenue * 0.15)}</Text>
          </View>
          <View style={styles.kpiBox}>
             <Text style={styles.subtitle}>Consolidated Asset Value</Text>
             <Text style={[styles.value, {fontSize: 14, marginTop: 4}]}>{formatCurrency(stats.inventoryValue)}</Text>
          </View>
          <View style={styles.kpiBox}>
             <Text style={styles.subtitle}>Closed-Loop Pipeline</Text>
             <Text style={[styles.value, {fontSize: 14, marginTop: 4}]}>{stats.ordersCount.completed} Successful</Text>
          </View>
        </View>
      </View>

      {/* Artisanal Inventory Ledger */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Artisanal Inventory Ledger</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.cellHeader, styles.colName]}>PIECE DESCRIPTION</Text>
          <Text style={[styles.cellHeader, styles.colStock]}>STOCK</Text>
          <Text style={[styles.cellHeader, styles.colVal]}>VALUATION (N$)</Text>
        </View>
        {(inventoryList || []).map((p, i) => (
          <View key={i} style={styles.tableRow} wrap={false}>
            <Text style={styles.colName}>{p.name}</Text>
            <Text style={styles.colStock}>{p.stock_quantity}</Text>
            <Text style={styles.colVal}>{formatCurrency(p.price)}</Text>
          </View>
        ))}
        {(!inventoryList || inventoryList.length === 0) && (
          <Text style={{fontSize: 9, color: '#999', marginTop: 10, fontStyle: 'italic'}}>No inventory records detected in the studio repository.</Text>
        )}
      </View>

      {/* Operational Order Flow */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Operational Order Flow</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.cellHeader, styles.orderColId]}>ORDER ID</Text>
          <Text style={[styles.cellHeader, styles.orderColDate]}>DATE</Text>
          <Text style={[styles.cellHeader, styles.orderColClient]}>ARTISAN CLIENT</Text>
          <Text style={[styles.cellHeader, styles.orderColStatus]}>STATUS</Text>
          <Text style={[styles.cellHeader, styles.orderColTotal]}>TOTAL VALUE</Text>
        </View>
        {(allOrdersList || []).map((order, i) => (
          <View key={i} style={styles.tableRow} wrap={false}>
            <Text style={styles.orderColId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.orderColDate}>{formatDate(order.created_at)}</Text>
            <Text style={styles.orderColClient}>{order.customer_name}</Text>
            <Text style={[styles.orderColStatus, {textTransform: 'uppercase', fontStyle: 'italic'}]}>{order.status}</Text>
            <Text style={styles.orderColTotal}>{formatCurrency(order.total_amount)}</Text>
          </View>
        ))}
        {allOrdersList && allOrdersList.length > 0 && (
          <View style={[styles.tableRow, { backgroundColor: '#fafafa', borderTopWidth: 1, borderTopColor: '#c19b3a' }]}>
            <Text style={[styles.orderColId, { fontWeight: 700, color: '#1a1a1a' }]}>TOTAL</Text>
            <Text style={styles.orderColDate}></Text>
            <Text style={styles.orderColClient}></Text>
            <Text style={styles.orderColStatus}></Text>
            <Text style={styles.orderColTotal}>
              {formatCurrency(allOrdersList.reduce((sum, o) => sum + (o.total_amount || 0), 0))}
            </Text>
          </View>
        )}
        {(!allOrdersList || allOrdersList.length === 0) && (
          <Text style={{fontSize: 9, color: '#999', marginTop: 10, fontStyle: 'italic'}}>No orders detected within the current reporting cycle.</Text>
        )}
      </View>

      {/* Detailed Transactional Narrative (Documents) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detailed Transactional Narrative</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.cellHeader, styles.refCol]}>REF</Text>
          <Text style={[styles.cellHeader, styles.dateCol]}>DATE</Text>
          <Text style={[styles.cellHeader, styles.clientCol]}>CLIENT</Text>
          <Text style={[styles.cellHeader, styles.typeCol]}>TYPE</Text>
          <Text style={[styles.cellHeader, styles.statusCol]}>STATUS</Text>
          <Text style={[styles.cellHeader, styles.amountCol]}>AMOUNT</Text>
        </View>
        {(detailedLedger || []).map((doc, i) => (
          <View key={i} style={styles.ledgerRow} wrap={false}>
            <Text style={styles.refCol}>S2S-{doc.id.slice(0, 4)}</Text>
            <Text style={styles.dateCol}>{formatDate(doc.created_at)}</Text>
            <Text style={styles.clientCol}>{doc.orders?.customer_name || 'Individual Client'}</Text>
            <Text style={[styles.typeCol, {textTransform: 'uppercase'}]}>{doc.type}</Text>
            <Text style={[styles.statusCol, {color: doc.is_paid ? '#10b981' : '#f59e0b', fontWeight: 700}]}>
              {doc.is_paid ? 'PAID' : 'OPEN'}
            </Text>
            <Text style={styles.amountCol}>{formatCurrency(doc.grand_total)}</Text>
          </View>
        ))}
        {(!detailedLedger || detailedLedger.length === 0) && (
          <Text style={{fontSize: 9, color: '#999', marginTop: 10, fontStyle: 'italic'}}>No transactional records found in this cycle.</Text>
        )}
      </View>

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>Space2Standard Executive Repository — Confidential Artisan Records</Text>
        <Text style={styles.footerText}>Certified on {formatDate(new Date().toISOString())}</Text>
      </View>
    </Page>
  </Document>
);
