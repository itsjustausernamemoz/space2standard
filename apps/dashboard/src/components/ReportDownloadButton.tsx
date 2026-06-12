import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { FinanceReport } from './FinanceReport';

interface Props {
  stats: any;
  timeframe: string;
  recentActivity: any[];
  detailedLedger: any[];
  inventoryList: any[];
  allOrdersList: any[];
  businessInfo: any;
}

export default function ReportDownloadButton(props: Props) {
  return (
    <PDFDownloadLink
      key={`report-${props.detailedLedger.length}-${props.stats.totalRevenue}-${props.timeframe}`}
      document={<FinanceReport {...props} />}
      fileName={`Artisan_Ledger_Report_${new Date().toISOString().split('T')[0]}.pdf`}
      className="flex items-center gap-3 bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/20 px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500 transition-all"
    >
      {({ loading }) => (
        <>
          <Download size={14} />
          {loading ? 'Preparing Ledger...' : 'Generate High-Fidelity Report'}
        </>
      )}
    </PDFDownloadLink>
  );
}
