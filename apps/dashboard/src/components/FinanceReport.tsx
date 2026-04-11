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
  header: { marginBottom: 40, borderBottomWidth: 1, borderBottomColor: '#000000', paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 5 },
  subtitle: { fontSize: 10, color: '#666666', textTransform: 'uppercase', letterSpacing: 1 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eeeeee', paddingBottom: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 10, color: '#444444' },
  value: { fontSize: 10, fontWeight: 700 },
  footer: { position: 'absolute', bottom: 30, left: 50, right: 50, borderTopWidth: 1, borderTopColor: '#eeeeee', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#999999' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 20 },
  kpiBox: { width: '45%', padding: 15, backgroundColor: '#f9f9f9', borderRadius: 4, marginBottom: 10 }
});

interface ReportProps {
  stats: {
    totalRevenue: number;
    inventoryValue: number;
    ordersCount: { new: number; pending: number; completed: number };
    topProducts?: any[];
  };
  timeframe: string;
}

export const FinanceReport: React.FC<ReportProps> = ({ stats, timeframe }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Artisan Ledger Report</Text>
        <Text style={styles.subtitle}>Consolidated Financial & Operational Metrics | {timeframe}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Performance</Text>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiBox}>
             <Text style={styles.subtitle}>Gross Realised Revenue</Text>
             <Text style={[styles.value, {fontSize: 16, marginTop: 5}]}>{formatCurrency(stats.totalRevenue)}</Text>
          </View>
          <View style={styles.kpiBox}>
             <Text style={styles.subtitle}>VAT Collected (15%)</Text>
             <Text style={[styles.value, {fontSize: 16, marginTop: 5}]}>{formatCurrency(stats.totalRevenue * 0.15)}</Text>
          </View>
          <View style={styles.kpiBox}>
             <Text style={styles.subtitle}>Total Asset Valuation</Text>
             <Text style={[styles.value, {fontSize: 16, marginTop: 5}]}>{formatCurrency(stats.inventoryValue)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Operational Pipeline</Text>
        <View style={styles.row}>
          <Text style={styles.label}>New Artisan Inquiries</Text>
          <Text style={styles.value}>{stats.ordersCount.new}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pending Specifications (Quotations Issued)</Text>
          <Text style={styles.value}>{stats.ordersCount.pending}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Successfully Reconciled Orders</Text>
          <Text style={styles.value}>{stats.ordersCount.completed}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inventory Repository Status</Text>
        <Text style={styles.label}>The artisan inventory currently holds a total valuation of {formatCurrency(stats.inventoryValue)}. Metrics indicate stable stock levels across core collections.</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Space2Standard Executive Repository</Text>
        <Text style={styles.footerText}>Generated on {formatDate(new Date().toISOString())}</Text>
      </View>
    </Page>
  </Document>
);
