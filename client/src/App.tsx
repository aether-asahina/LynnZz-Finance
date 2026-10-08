import { FormEvent, ReactNode, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { startLogin } from "./const";
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
  hasData?: boolean;
  cashReserve?: string;
  savingRate?: string;
  debtRatio?: string;
};

type FinanceTransactionRecord = { id: number; type: "income" | "expense"; merchant: string; category: string; amount: number; occurredAt: string | Date };
type FinanceSnapshot = { transactions: FinanceTransactionRecord[]; summary: { income: number; expenses: number; cashflow: number; balance: number; categories: { name: string; total: number }[] }; budgets: { amount: number }[]; bills: { id: number; name: string; amount: number; dueAt: string | Date; status: "open" | "paid" }[] };
type TransactionInput = { type: "income" | "expense"; merchant: string; category: string; amount: number; occurredAt: string; note?: string };

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

function emptyWorkspaceData(kind: Workspace): WorkspaceData {
  return { label: kind === "personal" ? "Personal" : "Business", greeting: "Mulai dari satu transaksi", description: "Catat pemasukan dan pengeluaran pertama untuk melihat gambaran keuanganmu.", balance: 0, balanceChange: "Belum ada periode pembanding", income: 0, incomeChange: "Belum ada pemasukan", expenses: 0, expenseChange: "Belum ada pengeluaran", cashflow: 0, cashflowChange: "Belum ada cash flow", health: 0, healthLabel: "Belum ada data", budgetUsed: 0, budgetTotal: 0, chart: [0, 0, 0, 0, 0, 0], chartIncome: [0, 0, 0, 0, 0, 0], chartLabels: ["-", "-", "-", "-", "-", "-"], spending: [], bills: [], transactions: [], hasData: false, cashReserve: "—", savingRate: "—", debtRatio: "—" };
}

function snapshotToWorkspaceData(kind: Workspace, snapshot?: FinanceSnapshot): WorkspaceData {
  if (!snapshot) return emptyWorkspaceData(kind);
  const tx = snapshot.transactions.slice().sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  const expenseTotal = snapshot.summary.expenses;
  const spending = snapshot.summary.categories.slice(0, 5).map((item, index) => ({ name: item.name, value: expenseTotal ? Math.round((item.total / expenseTotal) * 100) : 0, total: item.total, color: ["#10251F", "#5EAF87", "#D9F66A", "#E78767", "#7F91D4"][index] }));
  const bills = snapshot.bills.filter(item => item.status === "open").sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()).slice(0, 4).map(item => ({ name: item.name, date: new Date(item.dueAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }), amount: item.amount, icon: <Receipt size={17} />, tone: "mint" }));
  const hasData = tx.length > 0;
  const income = snapshot.summary.income;
  const savingRate = income > 0 ? `${Math.round((snapshot.summary.cashflow / income) * 100)}%` : "—";
  return { label: kind === "personal" ? "Personal" : "Business", greeting: hasData ? "Ringkasan keuanganmu" : "Mulai dari satu transaksi", description: hasData ? "Semua angka di bawah berasal dari transaksi yang kamu catat." : "Catat pemasukan dan pengeluaran pertama untuk melihat gambaran keuanganmu.", balance: snapshot.summary.balance, balanceChange: "Saldo berjalan", income, incomeChange: "Periode berjalan", expenses: expenseTotal, expenseChange: "Periode berjalan", cashflow: snapshot.summary.cashflow, cashflowChange: "Periode berjalan", health: hasData ? Math.max(0, Math.min(100, 50 + Math.round((snapshot.summary.cashflow / Math.max(income, 1)) * 50))) : 0, healthLabel: hasData ? "Berdasarkan data" : "Belum ada data", budgetUsed: expenseTotal, budgetTotal: snapshot.budgets.reduce((sum, item) => sum + item.amount, 0), chart: [0, 0, 0, 0, 0, snapshot.summary.expenses], chartIncome: [0, 0, 0, 0, 0, snapshot.summary.income], chartLabels: ["-", "-", "-", "-", "-", "Kini"], spending, bills, transactions: tx.map(item => ({ merchant: item.merchant, category: item.category, date: new Date(item.occurredAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }), amount: item.amount, type: item.type, icon: item.type === "income" ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />, tone: item.type === "income" ? "mint" : "peach" })), hasData, cashReserve: hasData ? "Tersedia dari akun" : "—", savingRate, debtRatio: "Belum tersedia" };
}

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
          <div className="health-score"><div className="score-ring" style={{ "--score": `${data.health * 3.6}deg` } as React.CSSProperties}><div><strong>{data.hasData ? data.health : "—"}</strong><span>/ 100</span></div></div><div><span className="status-pill status-pill--good"><CheckCircle2 size={14} /> {data.healthLabel}</span><p>{data.hasData ? "Skor ini dihitung dari data transaksi yang kamu catat." : "Tambahkan transaksi untuk menghitung kesehatan keuangan."}</p></div></div>
          <div className="health-list"><div><span>Cash reserve</span><strong>{data.cashReserve}</strong></div><div><span>Saving rate</span><strong>{data.savingRate}</strong></div><div><span>Debt ratio</span><strong>{data.debtRatio}</strong></div></div>
          <button className="text-button" onClick={() => onNotice("Membuka rekomendasi kesehatan keuangan.")}>Lihat rekomendasi <ArrowUpRight size={15} /></button>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid--three">
        <article className="panel spending-panel">
          <div className="panel-heading"><div><p className="eyebrow">SPENDING</p><h2>Ke mana uangmu pergi?</h2></div><button className="icon-button" aria-label="Filter pengeluaran" onClick={() => onNotice("Filter kategori pengeluaran aktif.")}><SlidersHorizontal size={17} /></button></div>
          <div className="spending-total"><strong>{formatCompactIDR(data.expenses)}</strong><span>Pengeluaran bulan ini</span></div>
          <div className="spending-bars">{data.spending.length ? data.spending.map((item) => <div className="spending-item" key={item.name}><div className="spending-label"><span><i style={{ background: item.color }} />{item.name}</span><strong>{item.value}%</strong></div><ProgressBar value={item.value} color={item.name === "Lifestyle" || item.name === "Marketing" ? "peach" : item.name === "Mobilitas" ? "lime" : "mint"} /><div className="spending-meta"><span>{formatCompactIDR(item.total)}</span><span>{item.value}% dari total</span></div></div>) : <div className="empty-state">Belum ada pengeluaran tercatat.</div>}</div>
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
          <div className="bill-list">{data.bills.length ? data.bills.map((bill) => <div className="bill-row" key={bill.name}><span className={`bill-icon bill-icon--${bill.tone}`}>{bill.icon}</span><div className="bill-detail"><strong>{bill.name}</strong><span>{bill.date}</span></div><strong className="bill-amount">{formatCompactIDR(bill.amount)}</strong></div>) : <div className="empty-state">Belum ada tagihan terbuka.</div>}</div>
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
  return <div className="table-wrap">{transactions.length ? <table><thead><tr><th>Transaksi</th><th>Kategori</th><th>Tanggal</th><th className="align-right">Jumlah</th><th /></tr></thead><tbody>{transactions.map((transaction) => <tr key={`${transaction.merchant}-${transaction.date}`}><td><div className="transaction-name"><span className={`transaction-icon transaction-icon--${transaction.tone}`}>{transaction.icon}</span><strong>{transaction.merchant}</strong></div></td><td><span className="category-chip">{transaction.category}</span></td><td className="muted-text">{transaction.date}</td><td className={`align-right amount amount--${transaction.type}`}>{transaction.type === "income" ? "+" : "−"}{formatCompactIDR(transaction.amount)}</td><td><button className="icon-button icon-button--muted" aria-label={`Opsi ${transaction.merchant}`}><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table> : <div className="empty-state empty-state--table">Belum ada transaksi. Tambahkan pemasukan atau pengeluaran pertama.</div>}</div>;
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
  return <div className="page-stack"><section className="subpage-hero"><div className="subpage-icon">{current.icon}</div><div><p className="eyebrow eyebrow--lime">{current.eyebrow}</p><h1>{current.title}</h1><p className="lede">{current.description}</p></div><button className="button button--secondary" onClick={() => onNotice("Modul ini belum memiliki data tersimpan.")}><SlidersHorizontal size={16} /> Filter</button></section><section className="dashboard-grid dashboard-grid--two"><article className="panel placeholder-main"><div className="panel-heading"><div><p className="eyebrow">{data.label.toUpperCase()}</p><h2>{page === "transactions" ? "Transaksi terbaru" : page === "budget" ? "Ringkasan budget" : page === "accounts" ? "Total aset" : page === "reports" ? "Ringkasan bulan ini" : page === "insights" ? "Rekomendasi untukmu" : "Workspace preference"}</h2></div></div>{page === "transactions" ? <TransactionTable transactions={data.transactions} /> : <div className="placeholder-content"><div className="placeholder-stat"><span>{page === "accounts" ? "Nilai bersih" : page === "reports" ? "Net cash flow" : page === "insights" ? "Peluang ditemukan" : "Data tersimpan"}</span><strong>{page === "accounts" ? formatCompactIDR(data.balance) : page === "reports" ? formatCompactIDR(data.cashflow) : page === "insights" ? (data.hasData ? "Tersedia" : "—") : page === "budget" ? (data.budgetTotal ? formatCompactIDR(data.budgetTotal) : "—") : "—"}</strong></div><div className="empty-state">Belum ada data tersimpan untuk modul ini.</div></div>}</article><article className="panel side-note"><span className="side-note__icon"><Sparkles size={20} /></span><p className="eyebrow">LYNNZZ TIP</p><h3>{page === "insights" ? "Insight muncul dari kebiasaan nyata." : "Mulai dari data yang benar."}</h3><p>Tambahkan data pada workspace {data.label} untuk mengisi modul ini secara bertahap.</p></article></section></div>;
}

function AddTransactionModal({ onClose, onSave }: { onClose: () => void; onSave: (input: TransactionInput) => void }) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("Makanan");
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSave({ type, merchant, amount: Number(amount), occurredAt, category }); };
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><p className="eyebrow eyebrow--lime">QUICK ACTION</p><h2 id="modal-title">Tambah transaksi</h2></div><button className="icon-button" onClick={onClose} aria-label="Tutup modal"><X size={19} /></button></div><p className="modal-intro">Data ini akan tersimpan di workspace aktif.</p><form onSubmit={submit}><label>Jenis transaksi<select value={type} onChange={(event) => setType(event.target.value as "income" | "expense")}><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option></select></label><label>Deskripsi<input required value={merchant} onChange={(event) => setMerchant(event.target.value)} placeholder="Contoh: Belanja bulanan" /></label><div className="form-grid"><label>Jumlah<input required value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="1" placeholder="0" /></label><label>Tanggal<input required value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} type="date" /></label></div><label>Kategori<input required value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Makanan, Gaji, Tagihan..." /></label><div className="modal-actions"><button type="button" className="button button--secondary" onClick={onClose}>Batal</button><button type="submit" className="button button--primary"><CheckCircle2 size={16} /> Simpan transaksi</button></div></form></div></div>;
}

function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();
  const loginMutation = trpc.auth.loginEmail.useMutation();
  const signupMutation = trpc.auth.signupEmail.useMutation();
  const guestMutation = trpc.auth.guest.useMutation();
  const pending = loginMutation.isPending || signupMutation.isPending || guestMutation.isPending;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      if (mode === "login") await loginMutation.mutateAsync({ email, password });
      else await signupMutation.mutateAsync({ email, name, password });
      await utils.auth.session.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    }
  };

  const continueAsGuest = async () => {
    setError("");
    try {
      await guestMutation.mutateAsync();
      await utils.auth.session.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mode tamu belum tersedia.");
    }
  };

  return <div className="auth-shell"><div className="auth-visual"><div className="auth-visual__top"><BrandMark /><span className="auth-security"><CheckCircle2 size={14} /> Secure workspace</span></div><div className="auth-visual__copy"><p className="eyebrow eyebrow--lime">FINANCE, CLEARER</p><h1>Buat uangmu lebih mudah dibaca.</h1><p>Satu tampilan untuk keputusan yang lebih cepat — personal maupun business.</p></div><div className="auth-visual__card"><div className="auth-mini-chart"><span style={{ height: "32%" }} /><span style={{ height: "54%" }} /><span style={{ height: "45%" }} /><span style={{ height: "74%" }} /><span style={{ height: "63%" }} /><span style={{ height: "90%" }} /></div><div><span>Workspace</span><strong>Siap terhubung</strong></div><TrendingUp size={18} /></div><div className="auth-visual__footer"><span>Personal finance</span><span>Business finance</span><span>Insights</span></div></div><div className="auth-panel"><div className="auth-panel__inner"><div className="auth-mobile-brand"><BrandMark compact /></div><p className="eyebrow eyebrow--lime">LYNNZZ FINANCE ADVANCED</p><h2>{mode === "login" ? "Selamat datang kembali" : "Mulai dengan LynnZz"}</h2><p className="auth-subtitle">{mode === "login" ? "Masuk untuk melihat dashboard keuanganmu." : "Buat akun gratis dan mulai merapikan uangmu."}</p><div className="auth-mode-tabs"><button className={mode === "login" ? "is-active" : ""} onClick={() => { setMode("login"); setError(""); }}>Masuk</button><button className={mode === "signup" ? "is-active" : ""} onClick={() => { setMode("signup"); setError(""); }}>Daftar dengan email</button></div><form className="auth-form" onSubmit={submit}>{mode === "signup" && <label>Nama lengkap<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Nadia Anggraini" required /></label>}<label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 8 karakter" minLength={8} required /></label>{error && <div className="auth-error"><X size={15} />{error}</div>}<button className="button button--primary auth-submit" disabled={pending}>{pending ? "Memproses..." : mode === "login" ? "Masuk ke dashboard" : "Buat akun"}<ArrowUpRight size={16} /></button></form><div className="auth-divider"><span>atau</span></div><div className="auth-secondary-actions"><button className="button button--secondary" onClick={continueAsGuest} disabled={pending}><UserRound size={16} /> Lanjut sebagai tamu</button><button className="button button--secondary" onClick={() => { try { startLogin(); } catch (err) { setError(err instanceof Error ? err.message : "Login Manus belum tersedia."); } }} disabled={pending}><Sparkles size={16} /> Login Manus</button></div><p className="auth-legal">Dengan melanjutkan, kamu menyetujui penggunaan LynnZz Finance untuk mengelola data keuanganmu secara aman.</p></div></div></div>;
}

type StaticAccount = { name: string; email: string; passwordHash?: string; guest?: boolean };
const STATIC_ACCOUNT_KEY = "lynnzz_github_account_v1";
const STATIC_SESSION_KEY = "lynnzz_github_session_v1";

async function hashStaticPassword(value: string) {
  if (window.crypto?.subtle) {
    const buffer = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return window.btoa(unescape(encodeURIComponent(value)));
}

function StaticAuthScreen({ onAuthenticated }: { onAuthenticated: (account: StaticAccount) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (password.length < 8) return setError("Password minimal 8 karakter.");
    const existing = JSON.parse(localStorage.getItem(STATIC_ACCOUNT_KEY) || "null") as StaticAccount | null;
    const passwordHash = await hashStaticPassword(password);
    if (mode === "signup") {
      if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return setError("Masukkan email yang valid.");
      const account = { name: name.trim() || normalizedEmail.split("@")[0], email: normalizedEmail, passwordHash };
      localStorage.setItem(STATIC_ACCOUNT_KEY, JSON.stringify(account));
      localStorage.setItem(STATIC_SESSION_KEY, JSON.stringify(account));
      onAuthenticated(account);
    } else if (existing?.email === normalizedEmail && existing.passwordHash === passwordHash) {
      localStorage.setItem(STATIC_SESSION_KEY, JSON.stringify(existing));
      onAuthenticated(existing);
    } else setError("Email atau password tidak sesuai di perangkat ini.");
  };
  const guest = () => { const account = { name: "Tamu", email: "", guest: true }; localStorage.setItem(STATIC_SESSION_KEY, JSON.stringify(account)); onAuthenticated(account); };
  return <div className="auth-shell"><div className="auth-visual"><div className="auth-visual__top"><BrandMark /><span className="auth-security"><CheckCircle2 size={14} /> GitHub Pages mode</span></div><div className="auth-visual__copy"><p className="eyebrow eyebrow--lime">STATIC WORKSPACE</p><h1>Keuangan tetap bisa jalan di mana saja.</h1><p>Mode GitHub Pages menyimpan akun dan data lokal di browser perangkat ini.</p></div><div className="auth-visual__card"><div className="auth-mini-chart"><span style={{ height: "32%" }} /><span style={{ height: "54%" }} /><span style={{ height: "45%" }} /><span style={{ height: "74%" }} /><span style={{ height: "63%" }} /><span style={{ height: "90%" }} /></div><div><span>Local workspace</span><strong>Offline-ready</strong></div><TrendingUp size={18} /></div><div className="auth-visual__footer"><span>Tanpa server</span><span>Tanpa setup</span><span>Pribadi</span></div></div><div className="auth-panel"><div className="auth-panel__inner"><div className="auth-mobile-brand"><BrandMark compact /></div><p className="eyebrow eyebrow--lime">LYNNZZ FINANCE ADVANCED</p><h2>{mode === "login" ? "Masuk ke workspace" : "Buat akun lokal"}</h2><p className="auth-subtitle">{mode === "login" ? "Akun tersimpan aman di browser ini." : "Daftar untuk menyimpan sesi di perangkat ini."}</p><div className="auth-mode-tabs"><button className={mode === "login" ? "is-active" : ""} onClick={() => { setMode("login"); setError(""); }}>Masuk</button><button className={mode === "signup" ? "is-active" : ""} onClick={() => { setMode("signup"); setError(""); }}>Daftar dengan email</button></div><form className="auth-form" onSubmit={submit}>{mode === "signup" && <label>Nama lengkap<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Contoh: Nadia Anggraini" required /></label>}<label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 8 karakter" minLength={8} required /></label>{error && <div className="auth-error"><X size={15} />{error}</div>}<button className="button button--primary auth-submit">{mode === "login" ? "Masuk ke dashboard" : "Buat akun"}<ArrowUpRight size={16} /></button></form><div className="auth-divider"><span>atau</span></div><button className="button button--secondary static-guest-button" onClick={guest}><UserRound size={16} /> Lanjut sebagai tamu</button><p className="auth-legal">Mode static GitHub Pages: data tidak masuk database server dan hanya tersedia di browser ini.</p></div></div></div>;
}

function GithubPagesApp() {
  const [session, setSession] = useState<StaticAccount | null>(() => { try { return JSON.parse(localStorage.getItem(STATIC_SESSION_KEY) || "null"); } catch { return null; } });
  const load = (kind: Workspace): FinanceSnapshot => { try { return JSON.parse(localStorage.getItem(`lynnzz_github_transactions_${kind}_v1`) || "{\"transactions\":[],\"summary\":{\"income\":0,\"expenses\":0,\"cashflow\":0,\"balance\":0,\"categories\":[]},\"budgets\":[],\"bills\":[]}"); } catch { return { transactions: [], summary: { income: 0, expenses: 0, cashflow: 0, balance: 0, categories: [] }, budgets: [], bills: [] }; } };
  const [snapshots, setSnapshots] = useState<Record<Workspace, FinanceSnapshot>>(() => ({ personal: load("personal"), business: load("business") }));
  if (!session) return <StaticAuthScreen onAuthenticated={setSession} />;
  const createTransaction = async (kind: Workspace, input: TransactionInput) => { const current = snapshots[kind]; const transaction = { id: Date.now(), ...input, occurredAt: input.occurredAt }; const transactions = [transaction, ...current.transactions]; const income = transactions.filter(item => item.type === "income").reduce((sum, item) => sum + item.amount, 0); const expenses = transactions.filter(item => item.type === "expense").reduce((sum, item) => sum + item.amount, 0); const categories = Array.from(transactions.filter(item => item.type === "expense").reduce((map, item) => map.set(item.category, (map.get(item.category) ?? 0) + item.amount), new Map<string, number>()), ([name, total]) => ({ name, total })); const next = { ...current, transactions, summary: { income, expenses, cashflow: income - expenses, balance: income - expenses, categories } }; localStorage.setItem(`lynnzz_github_transactions_${kind}_v1`, JSON.stringify(next)); setSnapshots(prev => ({ ...prev, [kind]: next })); };
  return <FinanceApp liveData={{ personal: snapshotToWorkspaceData("personal", snapshots.personal), business: snapshotToWorkspaceData("business", snapshots.business) }} onCreateTransaction={createTransaction} profileName={session.name} onLogout={() => { localStorage.removeItem(STATIC_SESSION_KEY); setSession(null); }} />;
}

function FinanceApp({ onLogout, liveData, onCreateTransaction, profileName }: { onLogout: () => void; liveData: Record<Workspace, WorkspaceData>; onCreateTransaction: (kind: Workspace, input: TransactionInput) => Promise<void>; profileName: string }) {
  const [workspace, setWorkspace] = useState<Workspace>("personal");
  const [page, setPage] = useState<Page>("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const data = liveData[workspace];
  const profileInitials = profileName.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
  const filteredTransactions = useMemo(() => data.transactions.filter((transaction) => `${transaction.merchant} ${transaction.category}`.toLowerCase().includes(search.toLowerCase())), [data, search]);
  const announce = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3000); };
  const handleSave = async (input: TransactionInput) => { await onCreateTransaction(workspace, input); setShowModal(false); announce("Transaksi berhasil disimpan."); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? "sidebar--open" : ""}`}>
      <div className="sidebar-top"><BrandMark /><button className="mobile-close icon-button" onClick={() => setMobileMenu(false)} aria-label="Tutup menu"><X size={18} /></button></div>
      <div className="workspace-switcher"><span className={`workspace-avatar workspace-avatar--${workspace}`}>{workspace === "personal" ? <UserRound size={16} /> : <BriefcaseBusiness size={16} />}</span><div><span className="workspace-label">Workspace aktif</span><strong>{data.label}</strong></div><ChevronDown size={15} className="workspace-chevron" /></div>
      <div className="workspace-tabs"><button className={workspace === "personal" ? "is-active" : ""} onClick={() => { setWorkspace("personal"); setPage("overview"); setMobileMenu(false); }}><UserRound size={14} /> Personal</button><button className={workspace === "business" ? "is-active" : ""} onClick={() => { setWorkspace("business"); setPage("overview"); setMobileMenu(false); }}><BriefcaseBusiness size={14} /> Business</button></div>
      <nav className="main-nav"><span className="nav-section-label">Workspace</span>{navItems.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? "is-active" : ""}`} onClick={() => { setPage(item.id); setMobileMenu(false); }}>{item.icon}<span>{item.label}</span>{item.id === "insights" && <span className="nav-badge">4</span>}</button>)}</nav>
      <div className="sidebar-bottom"><button className={`nav-item ${page === "settings" ? "is-active" : ""}`} onClick={() => { setPage("settings"); setMobileMenu(false); }}><Settings2 size={18} /><span>Settings</span></button><div className="upgrade-card"><span className="upgrade-icon"><Sparkles size={16} /></span><strong>Advanced mode</strong><p>Semua sinyal keuangan di satu tempat.</p><button onClick={() => announce("Semua fitur Advanced sudah aktif di preview.")}>Jelajahi fitur <ArrowUpRight size={14} /></button></div><button className="profile-row profile-row-button" onClick={onLogout} title="Keluar dari akun"><span className="profile-avatar">{profileInitials}</span><div><strong>{profileName}</strong><span>Keluar dari akun</span></div><MoreHorizontal size={17} className="profile-more" /></button></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu-button icon-button" onClick={() => setMobileMenu(true)} aria-label="Buka menu"><Menu size={20} /></button><div className="breadcrumb"><span>LynnZz Finance</span><ChevronRight size={14} /><strong>{navItems.find((item) => item.id === page)?.label ?? "Settings"}</strong></div></div><div className="topbar-actions"><label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari transaksi..." aria-label="Cari transaksi" />{search && <button onClick={() => setSearch("")} aria-label="Hapus pencarian"><X size={14} /></button>}<kbd>⌘ K</kbd></label><button className="icon-button notification-button" onClick={() => announce("Belum ada notifikasi baru.")} aria-label="Notifikasi"><Bell size={18} /><span /></button><span className="topbar-avatar">{profileInitials}</span></div></header>
      <div className="content-wrap">{page === "overview" ? <Overview data={data} workspace={workspace} onAddTransaction={() => setShowModal(true)} onNotice={announce} /> : page === "transactions" ? <div className="page-stack"><PagePlaceholder page={page} data={data} onNotice={announce} />{search && <section className="panel transactions-panel search-results"><div className="panel-heading"><div><p className="eyebrow">SEARCH RESULT</p><h2>{filteredTransactions.length} transaksi ditemukan</h2></div></div><TransactionTable transactions={filteredTransactions} /></section>}</div> : <PagePlaceholder page={page} data={data} onNotice={announce} />}</div>
    </main>
    {notice && <div className="toast"><CheckCircle2 size={17} /><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Tutup notifikasi"><X size={14} /></button></div>}
    {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onSave={handleSave} />}
  </div>;
}

function ServerApp() {
  const sessionQuery = trpc.auth.session.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => sessionQuery.refetch() });
  const personalQuery = trpc.finance.dashboard.useQuery({ kind: "personal" }, { enabled: Boolean(sessionQuery.data), retry: false });
  const businessQuery = trpc.finance.dashboard.useQuery({ kind: "business" }, { enabled: Boolean(sessionQuery.data), retry: false });
  const createMutation = trpc.finance.createTransaction.useMutation();
  if (sessionQuery.isLoading) return <div className="auth-loading"><BrandMark /><span>Menyiapkan workspace...</span></div>;
  if (!sessionQuery.data) return <AuthScreen />;
  if (personalQuery.isLoading || businessQuery.isLoading) return <div className="auth-loading"><BrandMark /><span>Memuat data keuangan...</span></div>;
  const createTransaction = async (kind: Workspace, input: TransactionInput) => { await createMutation.mutateAsync({ kind, ...input }); await Promise.all([personalQuery.refetch(), businessQuery.refetch()]); };
  return <FinanceApp liveData={{ personal: snapshotToWorkspaceData("personal", personalQuery.data), business: snapshotToWorkspaceData("business", businessQuery.data) }} onCreateTransaction={createTransaction} profileName={sessionQuery.data.user.name ?? sessionQuery.data.user.email ?? "Akun"} onLogout={() => logoutMutation.mutate()} />;
}

function App() {
  const isGithubPages = typeof window !== "undefined" && window.location.hostname.endsWith("github.io");
  return isGithubPages ? <GithubPagesApp /> : <ServerApp />;
}

export default App;
