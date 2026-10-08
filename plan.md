

## Update persistence finance

Dashboard sekarang tidak lagi menggunakan angka contoh pada jalur aplikasi aktif. Database menambahkan tabel `finance_workspaces`, `finance_transactions`, `finance_budgets`, dan `finance_bills`. Workspace Personal dan Business dibuat otomatis saat user pertama kali membuka dashboard, tetapi seluruh workspace dimulai kosong. Ringkasan saldo, pemasukan, pengeluaran, cash flow, kategori, dan transaksi terbaru dihitung dari baris transaksi milik user dan workspace aktif.

Endpoint tRPC `finance.dashboard`, `finance.createTransaction`, dan `finance.deleteTransaction` menerapkan row ownership melalui user dan workspace. Mode GitHub Pages menggunakan localStorage sebagai persistence browser-only karena Pages tidak menjalankan Express/MySQL; tidak ada angka seed atau transaksi demo di bundle aktif.
