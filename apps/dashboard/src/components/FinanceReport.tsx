import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { formatCurrency, formatDate } from '@shared/utils';

// Register premium fonts for the report
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: { padding: 50, backgroundColor: '#ffffff', fontFamily: 'Inter' },
  header: { marginBottom: 30, borderBottomWidth: 1, borderBottomColor: '#000000', paddingBottom: 15 },
  title: { fontSize: 22, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 5 },
  subtitle: { fontSize: 9, color: '#666666', textTransform: 'uppercase', letterSpacing: 1.5 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#eeeeee', paddingBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
  label: { fontSize: 9, color: '#444444' },
  value: { fontSize: 9, fontWeight: 700 },
  footer: { position: 'absolute', bottom: 30, left: 50, right: 50, borderTopWidth: 1, borderTopColor: '#eeeeee', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: '#999999' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 15 },
  kpiBox: { width: '47%', padding: 12, backgroundColor: '#f9f9f9', borderRadius: 4, marginBottom: 8 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eeeeee', paddingBottom: 5, marginBottom: 8, backgroundColor: '#fafafa' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f5f5f5', paddingBottom: 6, paddingTop: 6, alignItems: 'center' },
  col1: { width: '60%', fontSize: 9 },
  col2: { width: '20%', fontSize: 9, textAlign: 'center' },
  col3: { width: '20%', fontSize: 9, textAlign: 'right', fontWeight: 700 },
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
}

export const FinanceReport: React.FC<ReportProps> = ({ stats, timeframe, recentActivity }) => (
  <Document title="Artisan Executive Ledger">
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Artisan Ledger Report</Text>
        <Text style={styles.subtitle}>Executive Financial & Operational Repository | {timeframe}</Text>
      </View>

      <View style={styles.section}>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Creative Performance (Bestsellers)</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.col1, {fontWeight: 700, fontSize: 8, color: '#888'}]}>ARTISANAL PIECE</Text>
          <Text style={[styles.col2, {fontWeight: 700, fontSize: 8, color: '#888'}]}>VOLUME</Text>
          <Text style={[styles.col3, {fontWeight: 700, fontSize: 8, color: '#888'}]}>REVENUE</Text>
        </View>
        {(stats.topProducts || []).map((p, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.col1}>{p.name}</Text>
            <Text style={styles.col2}>{p.quantity}</Text>
            <Text style={styles.col3}>{formatCurrency(p.revenue)}</Text>
          </View>
        ))}
        {(!stats.topProducts || stats.topProducts.length === 0) && (
          <Text style={{fontSize: 9, color: '#999', marginTop: 10, fontStyle: 'italic'}}>No specific product data attributed to this cycle.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client Portfolio Leaders</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.col1, {fontWeight: 700, fontSize: 8, color: '#888'}]}>ARTISAN CLIENT</Text>
          <Text style={[styles.col3, {width: '40%', fontWeight: 700, fontSize: 8, color: '#888'}]}>TOTAL LEDGER VALUE</Text>
        </View>
        {(stats.topClients || []).map((c, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={styles.col1}>
               <Text>{c.full_name}</Text>
               <Text style={{fontSize: 7, color: '#888'}}>{c.email}</Text>
            </View>
            <Text style={[styles.col3, {width: '40%'}]}>{formatCurrency(c.total_revenue)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consolidated Activity Flow</Text>
        {(recentActivity || []).map((act, i) => (
          <View key={i} style={[styles.row, {marginBottom: 4}]}>
            <Text style={styles.label}>Order intake from {act.customer_name}</Text>
            <Text style={styles.badge}>{formatDate(act.created_at)}</Text>
          </View>
        ))}
        {(!recentActivity || recentActivity.length === 0) && (
          <Text style={{fontSize: 9, color: '#999', fontStyle: 'italic'}}>No recent operational shifts detected in this window.</Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Space2Standard Executive Repository — Confidential Artisan Records</Text>
        <Text style={styles.footerText}>Certified on {formatDate(new Date().toISOString())}</Text>
      </View>
    </Page>
  </Document>
);
