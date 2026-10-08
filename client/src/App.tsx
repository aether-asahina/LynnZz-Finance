import { FormEvent, ReactNode, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Download,
  FileText,
  Home,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  Menu,
  MoreHorizontal,
  PiggyBank,
  Plus,
  Receipt,
  Search,
  Settings2,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

type Workspace = "personal" | "business";
type Page = "overview" | "transactions" | "budget" | "accounts" | "reports" | "insights" | "settings";

type Transaction = {
  merchant: string;
  category: string;
  date: string;
  amount: number;
  type: "income" | "expense";
  icon: ReactNode;
  tone: string;
};

type WorkspaceData = {
  label: string;
  greeting: string;
  description: string;
  balance: number;
  balanceChange: string;
  income: number;
  incomeChange: string;
  expenses: number;
  expenseChange: string;
  cashflow: number;
  cashflowChange: string;
  health: number;
  healthLabel: string;
  budgetUsed: number;
  budgetTotal: number;
  chart: number[];
  chartIncome: number[];
  chartLabels: string[];
  spending: { name: string; value: number; total: number; color: string }[];
  bills: { name: string; date: string; amount: number; icon: ReactNode; tone: string }[];
  transactions: Transaction[];
};

const personalData: WorkspaceData = {
  label: "Personal",
  greeting: "Selamat pagi, Nadia",
  description: "Ini ringkasan uangmu untuk membantu mengambil keputusan dengan lebih tenang.",
  balance: 24850000,
  balanceChange: "+8,4% dari bulan lalu",
  income: 18500000,
  incomeChange: "+12,8%",
  expenses: 9275000,
  expenseChange: "−4,2%",
  cashflow: 9225000,
  cashflowChange: "+18,6%",
  health: 82,
  healthLabel: "Sehat",
  budgetUsed: 9275000,
  budgetTotal: 14000000,
  chart: [42, 55, 48, 72, 62, 83, 76, 95, 86, 104, 91, 118],
  chartIncome: [68, 74, 78, 83, 80, 92, 89, 98, 94, 104, 101, 115],
  chartLabels: ["Nov", "Des", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt"],
  spending: [
    { name: "Hunian", value: 32, total: 2960000, color: "#10251F" },
    { name: "Makanan", value: 21, total: 1948000, color: "#5EAF87" },
    { name: "Mobilitas", value: 15, total: 1391000, color: "#D9F66A" },
    { name: "Lifestyle", value: 12, total: 1113000, color: "#E78767" },
  ],
  bills: [
    { name: "Kartu Kredit BCA", date: "Besok, 12 Okt", amount: 2145000, icon: <CreditCard size={17} />, tone: "peach" },
    { name: "Internet & TV", date: "15 Okt", amount: 489000, icon: <WalletCards size={17} />, tone: "mint" },
    { name: "Cicilan apartemen", date: "20 Okt", amount: 3200000, icon: <Home size={17} />, tone: "ink" },
  ],
  transactions: [
    { merchant: "Gaji — PT Karya Digital", category: "Pemasukan", date: "10 Okt 2026", amount: 18500000, type: "income", icon: <Building2 size={17} />, tone: "mint" },
    { merchant: "Tokopedia", category: "Belanja", date: "09 Okt 2026", amount: 349000, type: "expense", icon: <ShoppingBag size={17} />, tone: "peach" },
    { merchant: "Kopi Tuku", category: "Makanan", date: "08 Okt 2026", amount: 68000, type: "expense", icon: <CircleDollarSign size={17} />, tone: "yellow" },
    { merchant: "Transfer ke Tabungan", category: "Tabungan", date: "07 Okt 2026", amount: 2500000, type: "expense", icon: <PiggyBank size={17} />, tone: "blue" },
    { merchant: "PLN Pascabayar", category: "Tagihan", date: "05 Okt 2026", amount: 735000, type: "expense", icon: <Landmark size={17} />, tone: "violet" },
  ],
};

const businessData: WorkspaceData = {
  label: "Business",
  greeting: "Selamat pagi, Nadia",
  description: "Pantau kesehatan bisnis, runway, dan arus kas operasional dalam satu tampilan.",
  balance: 184650000,
  balanceChange: "+14,2% dari bulan lalu",
  income: 76500000,
  incomeChange: "+21,4%",
  expenses: 42350000,
  expenseChange: "−7,8%",
  cashflow: 34150000,
  cashflowChange: "+32,1%",
  health: 91,
  healthLabel: "Sangat sehat",
  budgetUsed: 42350000,
  budgetTotal: 65000000,
  chart: [54, 64, 58, 81, 78, 88, 91, 86, 105, 112, 106, 126],
  chartIncome: [77, 82, 86, 95, 91, 104, 101, 109, 111, 120, 118, 132],
  chartLabels: ["Nov", "Des", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt"],
  spending: [
    { name: "Payroll", value: 41, total: 17363500, color: "#10251F" },
    { name: "Operasional", value: 23, total: 9740500, color: "#5EAF87" },
    { name: "Marketing", value: 18, total: 7623000, color: "#D9F66A" },
    { name: "Tools & SaaS", value: 11, total: 4658500, color: "#E78767" },
  ],
  bills: [
    { name: "Payroll Oktober", date: "Besok, 12 Okt", amount: 18500000, icon: <BriefcaseBusiness size={17} />, tone: "ink" },
    { name: "Google Workspace", date: "15 Okt", amount: 1280000, icon: <WalletCards size={17} />, tone: "mint" },
    { name: "Pajak & BPJS", date: "20 Okt", amount: 5400000, icon: <FileText size={17} />, tone: "peach" },
  ],
  transactions: [
    { merchant: "Invoice #INV-2084", category: "Pendapatan proyek", date: "10 Okt 2026", amount: 38500000, type: "income", icon: <FileText size={17} />, tone: "mint" },
    { merchant: "Meta Ads", category: "Marketing", date: "09 Okt 2026", amount: 2480000, type: "expense", icon: <BarChart3 size={17} />, tone: "peach" },
    { merchant: "Kantor Bersama GoWork", category: "Operasional", date: "08 Okt 2026", amount: 4200000, type: "expense", icon: <Building2 size={17} />, tone: "yellow" },
    { merchant: "Transfer ke Payroll", category: "Payroll", date: "07 Okt 2026", amount: 18500000, type: "expense", icon: <BriefcaseBusiness size={17} />, tone: "blue" },
    { merchant: "AWS Cloud Services", category: "Tools & SaaS", date: "05 Okt 2026", amount: 1385000, type: "expense", icon: <Landmark size={17} />, tone: "violet" },
  ],
};

const navItems: { id: Page; label: string; icon: ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { id: "transactions", label: "Transactions", icon: <Receipt size={18} /> },
  { id: "budget", label: "Budget", icon: <Target size={18} /> },
  { id: "accounts", label: "Accounts", icon: <WalletCards size={18} /> },
  { id: "reports", label: "Reports", icon: <BarChart3 size={18} /> },
  { id: "insights", label: "Insights", icon: <Lightbulb size={18} /> },
];

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

const formatCompactIDR = (value: number) => {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1).replace(".", ",")} M`;
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1).replace(".", ",")} jt`;
  return formatIDR(value);
};

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? "brand-lockup--compact" : ""}`}>
      <span className="brand-mark">L<span>.</span></span>
      {!compact && <span className="brand-name">lynnzz</span>}
    </div>
  );
}

function Trend({ positive = true, children }: { positive?: boolean; children: string }) {
  return <span className={`trend ${positive ? "trend--up" : "trend--down"}`}>{positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{children}</span>;
}

function MetricCard({ icon, label, value, helper, trend, positive = true, accent = "default" }: { icon: ReactNode; label: string; value: string; helper: string; trend: string; positive?: boolean; accent?: string }) {
  return (
    <article className={`metric-card metric-card--${accent}`}>
      <div className="metric-card__top"><span className="metric-icon">{icon}</span><button className="icon-button icon-button--muted" aria-label="Opsi metrik"><MoreHorizontal size={18} /></button></div>
      <p className="eyebrow">{label}</p>
      <div className="metric-value">{value}</div>
      <div className="metric-footer"><Trend positive={positive}>{trend}</Trend><span>{helper}</span></div>
    </article>
  );
}

function CashflowChart({ data, income, labels }: { data: number[]; income: number[]; labels: string[] }) {
  const width = 680;
  const height = 220;
  const max = Math.max(...data, ...income) + 15;
  const points = (values: number[]) => values.map((value, index) => `${(index / (values.length - 1)) * width},${height - (value / max) * 170 + 10}`).join(" ");
  const areaPoints = `0,${height} ${points(data)} ${width},${height}`;
  return (
    <div className="chart-wrap">
      <svg className="cashflow-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Grafik arus kas enam bulan">
        {[0, 1, 2, 3].map((line) => <line key={line} x1="0" x2={width} y1={48 + line * 47} y2={48 + line * 47} className="chart-grid" />)}
        <polygon points={areaPoints} className="chart-area" />
        <polyline points={points(income)} className="chart-line chart-line--income" />
        <polyline points={points(data)} className="chart-line chart-line--expense" />
        {data.map((_, index) => <circle key={index} cx={(index / (data.length - 1)) * width} cy={height - (data[index] / max) * 170 + 10} r={index === data.length - 1 ? 4.5 : 2.5} className="chart-dot" />)}
      </svg>
      <div className="chart-labels">{labels.map((label) => <span key={label}>{label}</span>)}</div>
    </div>
  );
}

function ProgressBar({ value, color = "mint" }: { value: number; color?: string }) {
  return <div className="progress-track"><span className={`progress-fill progress-fill--${color}`} style={{ width: `${Math.min(value, 100)}%` }} /></div>;
}

function Overview({ data, workspace, onAddTransaction, onNotice }: { data: WorkspaceData; workspace: Workspace; onAddTransaction: () => void; onNotice: (message: string) => void }) {
  const [range, setRange] = useState("6 bulan");
  const rangeOptions = ["6 bulan", "12 bulan", "Tahun ini"];
  const usage = Math.round((data.budgetUsed / data.budgetTotal) * 100);

  return (
    <div className="page-stack">
      <section className="welcome-row">
        <div><p className="eyebrow eyebrow--lime">{workspace === "personal" ? "PERSONAL FINANCE" : "BUSINESS FINANCE"}</p><h1>{data.greeting}</h1><p className="lede">{data.description}</p></div>
        <div className="welcome-actions"><button className="button button--secondary" onClick={() => onNotice("File siap diimpor — pilih CSV atau XLSX dari perangkatmu.")}><Upload size={16} /> Import data</button><button className="button button--primary" onClick={onAddTransaction}><Plus size={17} /> Transaksi baru</button></div>
      </section>

      <section className="metric-grid">
        <MetricCard icon={<WalletCards size={19} />} label="Total saldo" value={formatCompactIDR(data.balance)} helper="vs bulan lalu" trend={data.balanceChange} accent="ink" />
        <MetricCard icon={<ArrowUpRight size={19} />} label="Pemasukan" value={formatCompactIDR(data.income)} helper="bulan ini" trend={data.incomeChange} />
        <MetricCard icon={<ArrowDownRight size={19} />} label="Pengeluaran" value={formatCompactIDR(data.expenses)} helper="bulan ini" trend={data.expenseChange} positive={false} accent="peach" />
        <MetricCard icon={<TrendingUp size={19} />} label="Net cash flow" value={formatCompactIDR(data.cashflow)} helper="bulan ini" trend={data.cashflowChange} accent="lime" />
      </section>

      <section className="dashboard-grid dashboard-grid--wide">
        <article className="panel chart-panel">
          <div className="panel-heading"><div><p className="eyebrow">CASH FLOW</p><h2>Arus kas</h2></div><div className="segmented-control">{rangeOptions.map((option) => <button key={option} className={range === option ? "is-active" : ""} onClick={() => setRange(option)}>{option}</button>)}</div></div>
          <div className="chart-legend"><span><i className="legend-dot legend-dot--income" /> Pemasukan</span><span><i className="legend-dot legend-dot--expense" /> Pengeluaran</span><span className="chart-summary">Net <strong>{formatCompactIDR(data.cashflow)}</strong></span></div>
          <CashflowChart data={data.chart} income={data.chartIncome} labels={data.chartLabels} />
        </article>
        <article className="panel health-panel">
          <div className="panel-heading"><div><p className="eyebrow">FINANCIAL HEALTH</p><h2>Kesehatan keuangan</h2></div><button className="icon-button" aria-label="Lihat detail kesehatan" onClick={() => onNotice("Detail kesehatan keuangan akan segera tersedia.")}><ChevronRight size={18} /></button></div>
          <div className="health-score"><div className="score-ring" style={{ "--score": `${data.health * 3.6}deg` } as React.CSSProperties}><div><strong>{data.health}</strong><span>/ 100</span></div></div><div><span className="status-pill status-pill--good"><CheckCircle2 size={14} /> {data.healthLabel}</span><p>Skor naik 6 poin sejak bulan lalu. Kebiasaan cash flow-mu konsisten.</p></div></div>
          <div className="health-list"><div><span>Cash reserve</span><strong>4,2 bulan</strong></div><div><span>Saving rate</span><strong>49,9%</strong></div><div><span>Debt ratio</span><strong>12,4%</strong></div></div>
          <button className="text-button" onClick={() => onNotice("Membuka rekomendasi kesehatan keuangan.")}>Lihat rekomendasi <ArrowUpRight size={15} /></button>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid--three">
        <article className="panel spending-panel">
          <div className="panel-heading"><div><p className="eyebrow">SPENDING</p><h2>Ke mana uangmu pergi?</h2></div><button className="icon-button" aria-label="Filter pengeluaran" onClick={() => onNotice("Filter kategori pengeluaran aktif.")}><SlidersHorizontal size={17} /></button></div>
          <div className="spending-total"><strong>{formatCompactIDR(data.expenses)}</strong><span>Pengeluaran bulan ini</span></div>
          <div className="spending-bars">{data.spending.map((item) => <div className="spending-item" key={item.name}><div className="spending-label"><span><i style={{ background: item.color }} />{item.name}</span><strong>{item.value}%</strong></div><ProgressBar value={item.value * 2.45} color={item.name === "Lifestyle" || item.name === "Marketing" ? "peach" : item.name === "Mobilitas" ? "lime" : "mint"} /><div className="spending-meta"><span>{formatCompactIDR(item.total)}</span><span>{item.value}% dari total</span></div></div>)}</div>
          <button className="text-button" onClick={() => onNotice("Laporan kategori pengeluaran dipilih.")}>Lihat semua kategori <ArrowUpRight size={15} /></button>
        </article>
        <article className="panel budget-panel">
          <div className="panel-heading"><div><p className="eyebrow">BUDGET</p><h2>Budget bulan ini</h2></div><button className="icon-button" aria-label="Buka budget" onClick={() => onNotice("Membuka detail budget bulan ini.")}><MoreHorizontal size={18} /></button></div>
          <div className="budget-ring"><div className="budget-ring__inner"><strong>{usage}%</strong><span>terpakai</span></div></div>
          <div className="budget-copy"><strong>{formatCompactIDR(data.budgetTotal - data.budgetUsed)}</strong><span>tersisa dari {formatCompactIDR(data.budgetTotal)}</span></div>
          <ProgressBar value={usage} color="lime" />
          <div className="budget-foot"><span><i className="legend-dot legend-dot--expense" /> Terpakai</span><span><i className="legend-dot legend-dot--empty" /> Tersisa</span></div>
          <button className="button button--outline button--full" onClick={() => onNotice("Budget baru siap dibuat.")}><Plus size={15} /> Tambah budget</button>
        </article>
        <article className="panel bills-panel">
          <div className="panel-heading"><div><p className="eyebrow">UPCOMING</p><h2>Tagihan mendatang</h2></div><button className="icon-button" aria-label="Lihat semua tagihan" onClick={() => onNotice("Menampilkan semua tagihan mendatang.")}><ChevronRight size={18} /></button></div>
          <div className="bill-list">{data.bills.map((bill) => <div className="bill-row" key={bill.name}><span className={`bill-icon bill-icon--${bill.tone}`}>{bill.icon}</span><div className="bill-detail"><strong>{bill.name}</strong><span>{bill.date}</span></div><strong className="bill-amount">{formatCompactIDR(bill.amount)}</strong></div>)}</div>
          <div className="bill-note"><CalendarDays size={16} /><span>Total tagihan 30 hari ke depan <strong>{formatCompactIDR(data.bills.reduce((sum, bill) => sum + bill.amount, 0))}</strong></span></div>
        </article>
      </section>

      <section className="panel transactions-panel">
        <div className="panel-heading"><div><p className="eyebrow">ACTIVITY</p><h2>Transaksi terbaru</h2></div><button className="text-button" onClick={() => onNotice("Buka halaman semua transaksi.")}>Lihat semua <ArrowUpRight size={15} /></button></div>
        <TransactionTable transactions={data.transactions.slice(0, 4)} />
      </section>
    </div>
  );
}

function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  return <div className="table-wrap"><table><thead><tr><th>Transaksi</th><th>Kategori</th><th>Tanggal</th><th className="align-right">Jumlah</th><th /></tr></thead><tbody>{transactions.map((transaction) => <tr key={`${transaction.merchant}-${transaction.date}`}><td><div className="transaction-name"><span className={`transaction-icon transaction-icon--${transaction.tone}`}>{transaction.icon}</span><strong>{transaction.merchant}</strong></div></td><td><span className="category-chip">{transaction.category}</span></td><td className="muted-text">{transaction.date}</td><td className={`align-right amount amount--${transaction.type}`}>{transaction.type === "income" ? "+" : "−"}{formatCompactIDR(transaction.amount)}</td><td><button className="icon-button icon-button--muted" aria-label={`Opsi ${transaction.merchant}`}><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div>;
}

function PagePlaceholder({ page, data, onNotice }: { page: Page; data: WorkspaceData; onNotice: (message: string) => void }) {
  const config: Record<Exclude<Page, "overview">, { eyebrow: string; title: string; description: string; icon: ReactNode }> = {
    transactions: { eyebrow: "ACTIVITY CENTER", title: "Semua transaksi", description: "Cari, filter, dan rapikan seluruh pergerakan uangmu.", icon: <Receipt size={22} /> },
    budget: { eyebrow: "PLAN AHEAD", title: "Budget & goals", description: "Buat batas yang realistis dan lihat progresmu tanpa menebak.", icon: <Target size={22} /> },
    accounts: { eyebrow: "YOUR MONEY", title: "Akun & aset", description: "Satu tempat untuk rekening, kartu, tabungan, dan investasi.", icon: <WalletCards size={22} /> },
    reports: { eyebrow: "MAKE IT CLEAR", title: "Reports", description: "Ubah data harian menjadi cerita yang membantu keputusan.", icon: <BarChart3 size={22} /> },
    insights: { eyebrow: "SMARTER MOVES", title: "Insights", description: "Temukan pola kecil yang bisa membuat dampak besar.", icon: <Lightbulb size={22} /> },
    settings: { eyebrow: "WORKSPACE", title: "Pengaturan", description: "Atur preferensi workspace dan cara LynnZz bekerja untukmu.", icon: <Settings2 size={22} /> },
  };
  const current = config[page as Exclude<Page, "overview">];
  return <div className="page-stack"><section className="subpage-hero"><div className="subpage-icon">{current.icon}</div><div><p className="eyebrow eyebrow--lime">{current.eyebrow}</p><h1>{current.title}</h1><p className="lede">{current.description}</p></div><button className="button button--primary" onClick={() => onNotice(`${current.title} siap dikembangkan dengan data terhubung.`)}><Plus size={17} /> Tambah baru</button></section><section className="dashboard-grid dashboard-grid--two"><article className="panel placeholder-main"><div className="panel-heading"><div><p className="eyebrow">{data.label.toUpperCase()}</p><h2>{page === "transactions" ? "Transaksi terbaru" : page === "budget" ? "Ringkasan budget" : page === "accounts" ? "Total aset" : page === "reports" ? "Ringkasan bulan ini" : page === "insights" ? "Rekomendasi untukmu" : "Workspace preference"}</h2></div><button className="button button--secondary" onClick={() => onNotice("Filter diterapkan.")}><SlidersHorizontal size={16} /> Filter</button></div>{page === "transactions" ? <TransactionTable transactions={data.transactions} /> : <div className="placeholder-content"><div className="placeholder-stat"><span>{page === "accounts" ? "Nilai bersih" : page === "reports" ? "Net cash flow" : page === "insights" ? "Peluang ditemukan" : "Progress"}</span><strong>{page === "accounts" ? formatCompactIDR(data.balance) : page === "reports" ? formatCompactIDR(data.cashflow) : page === "insights" ? "04" : page === "budget" ? "66%" : "Aktif"}</strong></div><div className="placeholder-lines"><span /><span /><span /><span /><span /></div><button className="text-button" onClick={() => onNotice("Detail sedang disiapkan.")}>Lihat detail <ArrowUpRight size={15} /></button></div>}</article><article className="panel side-note"><span className="side-note__icon"><Sparkles size={20} /></span><p className="eyebrow">LYNNZZ TIP</p><h3>{page === "insights" ? "Jadikan pola sebagai kebiasaan." : "Lebih jelas, lebih cepat."}</h3><p>Gunakan workspace {data.label} untuk memisahkan konteks uang pribadi dan operasional tanpa kehilangan gambaran besar.</p><button className="button button--outline button--full" onClick={() => onNotice("Insight disimpan untuk dibaca nanti.")}>Simpan insight</button></article></section></div>;
}

function AddTransactionModal({ onClose, onSave }: { onClose: () => void; onSave: (message: string) => void }) {
  const [type, setType] = useState("Pengeluaran");
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSave(`${type} baru berhasil ditambahkan.`); };
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><p className="eyebrow eyebrow--lime">QUICK ACTION</p><h2 id="modal-title">Tambah transaksi</h2></div><button className="icon-button" onClick={onClose} aria-label="Tutup modal"><X size={19} /></button></div><p className="modal-intro">Catat pergerakan uang tanpa meninggalkan overview.</p><form onSubmit={submit}><label>Jenis transaksi<select value={type} onChange={(event) => setType(event.target.value)}><option>Pemasukan</option><option>Pengeluaran</option><option>Transfer</option></select></label><label>Deskripsi<input required placeholder="Contoh: Belanja bulanan" /></label><div className="form-grid"><label>Jumlah<input required type="number" min="0" placeholder="0" /></label><label>Tanggal<input required type="date" defaultValue="2026-10-08" /></label></div><label>Kategori<select defaultValue="Makanan"><option>Makanan</option><option>Belanja</option><option>Tagihan</option><option>Transportasi</option><option>Gaji</option></select></label><div className="modal-actions"><button type="button" className="button button--secondary" onClick={onClose}>Batal</button><button type="submit" className="button button--primary"><CheckCircle2 size={16} /> Simpan transaksi</button></div></form></div></div>;
}

function App() {
  const [workspace, setWorkspace] = useState<Workspace>("personal");
  const [page, setPage] = useState<Page>("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const data = workspace === "personal" ? personalData : businessData;
  const filteredTransactions = useMemo(() => data.transactions.filter((transaction) => `${transaction.merchant} ${transaction.category}`.toLowerCase().includes(search.toLowerCase())), [data, search]);
  const announce = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3000); };
  const handleSave = (message: string) => { setShowModal(false); announce(message); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? "sidebar--open" : ""}`}>
      <div className="sidebar-top"><BrandMark /><button className="mobile-close icon-button" onClick={() => setMobileMenu(false)} aria-label="Tutup menu"><X size={18} /></button></div>
      <div className="workspace-switcher"><span className={`workspace-avatar workspace-avatar--${workspace}`}>{workspace === "personal" ? <UserRound size={16} /> : <BriefcaseBusiness size={16} />}</span><div><span className="workspace-label">Workspace aktif</span><strong>{data.label}</strong></div><ChevronDown size={15} className="workspace-chevron" /></div>
      <div className="workspace-tabs"><button className={workspace === "personal" ? "is-active" : ""} onClick={() => { setWorkspace("personal"); setPage("overview"); setMobileMenu(false); }}><UserRound size={14} /> Personal</button><button className={workspace === "business" ? "is-active" : ""} onClick={() => { setWorkspace("business"); setPage("overview"); setMobileMenu(false); }}><BriefcaseBusiness size={14} /> Business</button></div>
      <nav className="main-nav"><span className="nav-section-label">Workspace</span>{navItems.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? "is-active" : ""}`} onClick={() => { setPage(item.id); setMobileMenu(false); }}>{item.icon}<span>{item.label}</span>{item.id === "insights" && <span className="nav-badge">4</span>}</button>)}</nav>
      <div className="sidebar-bottom"><button className={`nav-item ${page === "settings" ? "is-active" : ""}`} onClick={() => { setPage("settings"); setMobileMenu(false); }}><Settings2 size={18} /><span>Settings</span></button><div className="upgrade-card"><span className="upgrade-icon"><Sparkles size={16} /></span><strong>Advanced mode</strong><p>Semua sinyal keuangan di satu tempat.</p><button onClick={() => announce("Semua fitur Advanced sudah aktif di preview.")}>Jelajahi fitur <ArrowUpRight size={14} /></button></div><div className="profile-row"><span className="profile-avatar">NA</span><div><strong>Nadia Anggraini</strong><span>Owner account</span></div><MoreHorizontal size={17} className="profile-more" /></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu-button icon-button" onClick={() => setMobileMenu(true)} aria-label="Buka menu"><Menu size={20} /></button><div className="breadcrumb"><span>LynnZz Finance</span><ChevronRight size={14} /><strong>{navItems.find((item) => item.id === page)?.label ?? "Settings"}</strong></div></div><div className="topbar-actions"><label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari transaksi..." aria-label="Cari transaksi" />{search && <button onClick={() => setSearch("")} aria-label="Hapus pencarian"><X size={14} /></button>}<kbd>⌘ K</kbd></label><button className="icon-button notification-button" onClick={() => announce("Tidak ada notifikasi baru.")} aria-label="Notifikasi"><Bell size={18} /><span /></button><span className="topbar-avatar">NA</span></div></header>
      <div className="content-wrap">{page === "overview" ? <Overview data={data} workspace={workspace} onAddTransaction={() => setShowModal(true)} onNotice={announce} /> : page === "transactions" ? <div className="page-stack"><PagePlaceholder page={page} data={data} onNotice={announce} />{search && <section className="panel transactions-panel search-results"><div className="panel-heading"><div><p className="eyebrow">SEARCH RESULT</p><h2>{filteredTransactions.length} transaksi ditemukan</h2></div></div><TransactionTable transactions={filteredTransactions} /></section>}</div> : <PagePlaceholder page={page} data={data} onNotice={announce} />}</div>
    </main>
    {notice && <div className="toast"><CheckCircle2 size={17} /><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Tutup notifikasi"><X size={14} /></button></div>}
    {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onSave={handleSave} />}
  </div>;
}

export default App;
