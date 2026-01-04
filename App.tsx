import React, { useState, useMemo, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownLeft, Wallet, DollarSign, Filter, Search, 
  Activity, CreditCard, Upload, FileText, X, AlertCircle, TrendingUp, TrendingDown,
  ChevronUp, ChevronDown, ExternalLink, Calendar
} from 'lucide-react';
import { parseCSV, formatCurrency, formatDate } from './utils.ts';
import { Transaction, TransactionLabel } from './types.ts';

// --- Theme Constants ---
const THEME = {
  primary: '#D0F500', // Bitunix Lime
  primaryHover: '#bce000',
  bgDark: '#050505',
  bgCard: '#121212',
  border: '#27272a', // Zinc 800
  textMuted: '#a1a1aa', // Zinc 400
  textLight: '#f4f4f5', // Zinc 100
};

// --- Components ---

const BitunixLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg viewBox="0 0 140 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.5 0H6C2.68629 0 0 2.68629 0 6V26C0 29.3137 2.68629 32 6 32H18.5C25.9558 32 32 25.9558 32 18.5V13.5C32 6.04416 25.9558 0 18.5 0Z" fill={THEME.primary} />
    <path d="M10 10H16M10 16H20M10 22H14" stroke="black" strokeWidth="3" strokeLinecap="round" />
    <text x="40" y="24" fill="white" fontFamily="sans-serif" fontWeight="800" fontSize="24" letterSpacing="-0.5">Bitunix</text>
  </svg>
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = '' }: CardProps) => (
  <div className={`bg-[#121212] border border-zinc-800 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  trend?: number | null;
  trendLabel?: string;
}

const StatCard = ({ title, value, subValue, icon: Icon, trend, trendLabel }: StatCardProps) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-zinc-400 text-sm font-medium">{title}</h3>
      <div className="p-2 bg-zinc-900 rounded-lg" style={{ color: THEME.primary }}>
        <Icon size={20} />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <div>
        <p className="text-2xl font-bold text-zinc-100">{value}</p>
        {subValue && <p className="text-sm text-zinc-500 mt-1">{subValue}</p>}
      </div>
      {trend !== undefined && trend !== null && (
        <div className="text-right">
             <span className={`text-sm font-medium ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
            </span>
            {trendLabel && <p className="text-xs text-zinc-500">{trendLabel}</p>}
        </div>
      )}
    </div>
  </Card>
);

interface BadgeProps {
  children: React.ReactNode;
  type: TransactionLabel | string;
}

const Badge = ({ children, type }: BadgeProps) => {
  const styles: Record<string, string> = {
    [TransactionLabel.Deposit]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    [TransactionLabel.Withdraw]: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    [TransactionLabel.Swap]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    [TransactionLabel.FuturesProfit]: `bg-[#D0F500]/10 text-[#D0F500] border-[#D0F500]/20`,
    [TransactionLabel.FuturesLoss]: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    [TransactionLabel.RebateAgent]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    [TransactionLabel.RebateNormal]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    [TransactionLabel.SpotTrade]: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  };
  
  const className = styles[type] || styles.default;
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {children}
    </span>
  );
};

interface FileUploadProps {
  onUpload: (content: string) => void;
  error?: string | null;
}

const FileUpload = ({ onUpload, error }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        onUpload(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="flex justify-center mb-8">
            <BitunixLogo className="h-12 w-auto" />
        </div>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-zinc-100 mb-3 tracking-tight">PnL Calculator</h1>
          <p className="text-zinc-400 text-lg">Analyze your trading performance, fees, and flows</p>
        </div>

        {/* Instructions Card */}
        <div className="bg-[#121212] border border-zinc-800 rounded-xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <FileText size={120} />
          </div>
          
          <h2 style={{ color: THEME.primary }} className="font-semibold mb-5 flex items-center gap-2 relative z-10">
            <Activity size={18} />
            How to get your CSV data
          </h2>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-start gap-4">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-sm font-bold" style={{ color: THEME.primary }}>1</div>
               <div>
                 <p className="text-zinc-200 text-sm font-medium mb-1">Go to Taxes & API</p>
                 <p className="text-zinc-500 text-xs leading-relaxed">
                   Log in to your Bitunix account and navigate to the 
                   <a 
                     href="https://www.bitunix.com/taxes-api" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="hover:underline mx-1 inline-flex items-center gap-0.5 transition-colors"
                     style={{ color: THEME.primary }}
                   >
                     Taxes & API page <ExternalLink size={10} />
                   </a>
                 </p>
               </div>
            </div>

            <div className="flex items-start gap-4">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-sm font-bold" style={{ color: THEME.primary }}>2</div>
               <div>
                 <p className="text-zinc-200 text-sm font-medium mb-1">Generate Report</p>
                 <p className="text-zinc-500 text-xs leading-relaxed">
                   Select your desired <span className="text-zinc-300 font-medium">Date Range</span> and click <span className="text-zinc-300 font-medium">Generate</span>.
                 </p>
               </div>
            </div>

            <div className="flex items-start gap-4">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-sm font-bold" style={{ color: THEME.primary }}>3</div>
               <div>
                 <p className="text-zinc-200 text-sm font-medium mb-1">Upload CSV</p>
                 <p className="text-zinc-500 text-xs leading-relaxed">
                   Download the generated CSV file and drop it below.
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <Card className={`p-10 border-2 border-dashed transition-all duration-200 group ${
          dragActive 
            ? 'border-[#D0F500] bg-zinc-900/50' 
            : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/30'
        }`}>
          <form 
            className="flex flex-col items-center justify-center space-y-4"
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrop}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className={`p-4 rounded-full transition-colors duration-200 mb-2 ${
              dragActive ? 'bg-[#D0F500]/20 text-[#D0F500]' : 'bg-zinc-900 text-zinc-500 group-hover:text-[#D0F500] group-hover:bg-[#D0F500]/10'
            }`}>
              <Upload size={32} />
            </div>
            
            <div className="text-center space-y-1">
              <p className="text-lg font-medium text-zinc-200">
                Drag and drop your CSV file
              </p>
              <p className="text-sm text-zinc-500">
                or click to browse from your computer
              </p>
            </div>

            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              accept=".csv"
              onChange={handleChange}
            />
            
            <label 
              htmlFor="file-upload"
              className="mt-6 px-8 py-3 bg-[#D0F500] hover:bg-[#bce000] text-black text-sm font-bold rounded-full cursor-pointer transition-all shadow-lg shadow-[#D0F500]/20 hover:shadow-[#D0F500]/40 transform hover:-translate-y-0.5"
            >
              Select File
            </label>
          </form>
        </Card>
        
        {error && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-400 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="mt-8 text-center opacity-40 hover:opacity-80 transition-opacity">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full text-zinc-500 text-xs border border-zinc-800">
             <FileText size={14} />
             <span>Accepts standard Bitunix Transaction CSV</span>
           </div>
        </div>
      </div>
    </div>
  );
};

// Sort helper component
const SortHeader = ({ 
  label, 
  sortKey, 
  activeSort, 
  onSort 
}: { 
  label: string; 
  sortKey: keyof Transaction; 
  activeSort: { key: keyof Transaction; direction: 'asc' | 'desc' }; 
  onSort: (key: keyof Transaction) => void;
}) => {
  return (
    <th 
      className="px-6 py-4 font-semibold text-zinc-400 cursor-pointer hover:text-zinc-200 transition-colors group select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <div className="flex flex-col">
          <ChevronUp 
            size={10} 
            className={`text-zinc-600 ${activeSort.key === sortKey && activeSort.direction === 'asc' ? 'text-[#D0F500]' : 'group-hover:text-zinc-500'}`} 
          />
          <ChevronDown 
            size={10} 
            className={`-mt-1 text-zinc-600 ${activeSort.key === sortKey && activeSort.direction === 'desc' ? 'text-[#D0F500]' : 'group-hover:text-zinc-500'}`} 
          />
        </div>
      </div>
    </th>
  );
};

export default function App() {
  const [data, setData] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  
  const itemsPerPage = 10;

  const handleFileUpload = (content: string) => {
    try {
      const parsedData = parseCSV(content);
      if (parsedData.length === 0) {
        setUploadError("The CSV file appears to be empty or invalid.");
        return;
      }
      setData(parsedData);
      setUploadError(null);
    } catch (e) {
      setUploadError("Failed to parse CSV. Please check the file format.");
    }
  };

  const handleReset = () => {
    setData([]);
    setUploadError(null);
    setSearchQuery('');
    setFilterType('All');
    setCurrentPage(1);
    setSortConfig({ key: 'date', direction: 'desc' });
  };

  const handleSort = (key: keyof Transaction) => {
    let direction: 'asc' | 'desc' = 'desc'; // Default to desc for most things usually
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    } else if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else {
        // Default direction when switching columns
        direction = key === 'date' ? 'desc' : 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper to check if asset is a USD stablecoin
  const isStable = (asset: string) => ['USDT', 'USDC', 'DAI', 'FDUSD'].includes(asset);

  // Filter Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesType = filterType === 'All' || item.label === filterType;
      const matchesSearch = 
        item.trxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.incomingAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.outgoingAsset.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [data, filterType, searchQuery]);

  // Sort Data
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [filteredData, sortConfig]);

  // Pagination Logic
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Statistics
  const stats = useMemo(() => {
    let totalDepositsUSD = 0;
    let totalWithdrawalsUSD = 0;
    let futuresPnL = 0;
    let totalFeesUSD = 0;
    let referralRewards = 0;

    data.forEach(t => {
      // Estimate PnL (Futures Profit - Futures Loss)
      if (t.label === TransactionLabel.FuturesProfit && isStable(t.incomingAsset)) {
        futuresPnL += t.incomingAmount;
      } else if (t.label === TransactionLabel.FuturesLoss && isStable(t.outgoingAsset)) {
        futuresPnL -= t.outgoingAmount;
      }

      // Track Fees (Aggregate USDT and USDC)
      if (isStable(t.feeAsset)) {
        totalFeesUSD += t.feeAmount;
      }

      // Track Referrals
      if ((t.label === TransactionLabel.RebateAgent || t.label === TransactionLabel.RebateNormal) && isStable(t.incomingAsset)) {
        referralRewards += t.incomingAmount;
      }
      
      // Track Volume (Deposits/Withdrawals in USDT/USDC)
      if (t.label === TransactionLabel.Deposit && isStable(t.incomingAsset)) {
        totalDepositsUSD += t.incomingAmount;
      }
      if (t.label === TransactionLabel.Withdraw && isStable(t.outgoingAsset)) {
        totalWithdrawalsUSD += t.outgoingAmount;
      }
    });

    return {
      futuresPnL,
      totalFeesUSD,
      referralRewards,
      totalDepositsUSD,
      totalWithdrawalsUSD
    };
  }, [data]);

  // Breakdown by Type
  const breakdownStats = useMemo(() => {
    const map = new Map<string, { incoming: number; outgoing: number; count: number; fees: number }>();
    
    data.forEach(t => {
      const current = map.get(t.label) || { incoming: 0, outgoing: 0, count: 0, fees: 0 };
      
      // Aggregate Stablecoin values (USDT + USDC) for a consolidated USD view
      if (isStable(t.incomingAsset)) current.incoming += t.incomingAmount;
      if (isStable(t.outgoingAsset)) current.outgoing += t.outgoingAmount;
      if (isStable(t.feeAsset)) current.fees += t.feeAmount;
      
      current.count += 1;
      map.set(t.label, current);
    });
    
    // Convert to array and Sort by count descending
    return Array.from(map.entries())
      .map(([label, stats]) => ({ label, ...stats }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // Chart Data: Cumulative PnL Over Time
  const pnlChartData = useMemo(() => {
    let runningPnL = 0;
    // We need data sorted ascending by date for the chart
    const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
    const points: any[] = [];
    
    // Group by day to reduce points
    const groupedByDay = new Map();

    sorted.forEach(t => {
      if (t.label === TransactionLabel.FuturesProfit && isStable(t.incomingAsset)) {
        runningPnL += t.incomingAmount;
      } else if (t.label === TransactionLabel.FuturesLoss && isStable(t.outgoingAsset)) {
        runningPnL -= t.outgoingAmount;
      }
      
      const day = t.date.toISOString().split('T')[0];
      groupedByDay.set(day, runningPnL);
    });

    groupedByDay.forEach((val, key) => {
      points.push({ date: key, value: val });
    });

    return points;
  }, [data]);

  // Chart Data: Type Distribution
  const typeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(t => {
      counts[t.label] = (counts[t.label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  // Bitunix palette + supplementary colors
  const COLORS = ['#D0F500', '#f43f5e', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899', '#6366f1', '#14b8a6'];

  // Render File Upload if no data
  if (data.length === 0) {
    return <FileUpload onUpload={handleFileUpload} error={uploadError} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 p-4 md:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-6">
          <div className="flex items-center gap-4">
             <BitunixLogo className="h-8 w-auto" />
             <div className="h-6 w-px bg-zinc-800 hidden md:block"></div>
             <p className="text-zinc-500 text-sm hidden md:block">Transaction Analysis Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-full text-xs font-medium">
                {data.length} Transactions Loaded
                </span>
            </div>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-[#D0F500] hover:bg-[#bce000] text-black rounded-lg text-sm font-bold transition-colors"
            >
              <Upload size={16} strokeWidth={2.5} />
              New Upload
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
           <StatCard 
            title="Total Deposits" 
            value={formatCurrency(stats.totalDepositsUSD, 'USD')}
            icon={ArrowDownLeft}
            trend={null}
            subValue="Inflow (USDT + USDC)"
          />
           <StatCard 
            title="Total Withdrawals" 
            value={formatCurrency(stats.totalWithdrawalsUSD, 'USD')}
            icon={ArrowUpRight}
            trend={null}
            subValue="Outflow (USDT + USDC)"
          />
          <StatCard 
            title="Net Futures PnL" 
            value={formatCurrency(stats.futuresPnL, 'USD')}
            subValue="Realized"
            icon={Activity}
            trend={stats.futuresPnL > 0 ? 10 : -10} // Visual indicator only
          />
          <StatCard 
            title="Referral Rewards" 
            value={formatCurrency(stats.referralRewards, 'USD')} 
            subValue="Rebates"
            icon={DollarSign}
            trend={null}
          />
           <StatCard 
            title="Total Fees Paid" 
            value={formatCurrency(stats.totalFeesUSD, 'USD')} 
            subValue="Transaction costs"
            icon={CreditCard}
            trend={null}
          />
        </div>

        {/* Breakdown by Type Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#D0F500] rounded-full"></span>
            Breakdown by Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {breakdownStats.map((stat) => (
              <Card key={stat.label} className="p-5 hover:border-zinc-700 transition-colors">
                 <div className="flex items-center justify-between mb-4">
                   <Badge type={stat.label}>{stat.label}</Badge>
                   <span className="text-xs text-zinc-500 font-medium">{stat.count} txns</span>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Incoming</span>
                      <span className="text-emerald-400 font-medium">+{formatCurrency(stat.incoming, 'USD')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Outgoing</span>
                      <span className="text-rose-400 font-medium">-{formatCurrency(stat.outgoing, 'USD')}</span>
                    </div>
                    {stat.fees > 0 && (
                      <div className="flex justify-between text-sm pt-2 border-t border-zinc-800">
                        <span className="text-zinc-500">Fees</span>
                        <span className="text-zinc-300">{formatCurrency(stat.fees, 'USD')}</span>
                      </div>
                    )}
                     <div className="flex justify-between text-sm pt-2 border-t border-zinc-800 font-bold">
                        <span className="text-zinc-400">Net Flow</span>
                        <span className="text-zinc-200">
                          {formatCurrency(stat.incoming - stat.outgoing, 'USD')}
                        </span>
                      </div>
                 </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <h3 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#D0F500] rounded-full"></span>
                Cumulative Futures PnL
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pnlChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#52525b" 
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return `${date.getMonth()+1}/${date.getDate()}`;
                    }}
                    tick={{fontSize: 12}}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    tickFormatter={(val) => `$${val}`}
                    tick={{fontSize: 12}}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                    itemStyle={{ color: '#D0F500' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#D0F500" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 6, fill: '#D0F500', stroke: '#000' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
             <h3 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#D0F500] rounded-full"></span>
                Transaction Distribution
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#a1a1aa' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Transactions Section */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#D0F500] rounded-full"></span>
                Recent Transactions
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#D0F500] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search assets, IDs..." 
                  className="pl-10 pr-4 py-2 bg-[#121212] border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-[#D0F500] w-full sm:w-64 transition-all"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <select 
                  className="pl-10 pr-8 py-2 bg-[#121212] border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-[#D0F500] appearance-none cursor-pointer w-full sm:w-auto transition-all"
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                >
                  <option value="All">All Types</option>
                  {Object.values(TransactionLabel).map(label => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-800">
                    <SortHeader label="Date" sortKey="date" activeSort={sortConfig} onSort={handleSort} />
                    <SortHeader label="Type" sortKey="label" activeSort={sortConfig} onSort={handleSort} />
                    <SortHeader label="Outgoing" sortKey="outgoingAmount" activeSort={sortConfig} onSort={handleSort} />
                    <SortHeader label="Incoming" sortKey="incomingAmount" activeSort={sortConfig} onSort={handleSort} />
                    <SortHeader label="Fee" sortKey="feeAmount" activeSort={sortConfig} onSort={handleSort} />
                    <th className="px-6 py-4 font-semibold text-zinc-400 hidden lg:table-cell">Transaction ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {paginatedData.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge type={t.label}>{t.label}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {t.outgoingAmount > 0 ? (
                          <span className="text-zinc-300">
                             {formatCurrency(t.outgoingAmount, t.outgoingAsset)}
                          </span>
                        ) : <span className="text-zinc-700">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         {t.incomingAmount > 0 ? (
                          <span className="text-emerald-400 font-medium">
                            +{formatCurrency(t.incomingAmount, t.incomingAsset)}
                          </span>
                        ) : <span className="text-zinc-700">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                        {t.feeAmount > 0 ? formatCurrency(t.feeAmount, t.feeAsset) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-600 font-mono text-xs hidden lg:table-cell">
                        {t.trxId}
                      </td>
                    </tr>
                  ))}
                  {paginatedData.length === 0 && (
                     <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                        No transactions found
                      </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                  className="px-3 py-1 text-sm bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-300"
                >
                  Previous
                </button>
                <span className="text-sm text-zinc-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                   disabled={currentPage === totalPages}
                   onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                   className="px-3 py-1 text-sm bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-300"
                >
                  Next
                </button>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}