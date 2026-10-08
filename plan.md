# LynnZz Finance Advanced — Plan

## Tujuan produk
LynnZz Finance Advanced adalah workspace keuangan terpadu untuk kebutuhan personal dan bisnis. Versi awal yang dikirimkan memprioritaskan dashboard operasional yang dapat dipakai langsung dengan data demo realistis, pemisahan workspace, ringkasan KPI, visualisasi cash flow, breakdown pengeluaran, tagihan mendatang, transaksi terbaru, pencarian, filter periode, dan aksi tambah transaksi. Fondasi starter React/Express/tRPC/Drizzle tetap dipertahankan agar data persisten dan akun pengguna dapat ditambahkan tanpa mengganti stack.

## Implementasi
- Mengganti shell starter menjadi aplikasi dashboard React yang responsif di `client/src/App.tsx`.
- Menggunakan state lokal untuk workspace Personal/Business, halaman navigasi, periode, pencarian transaksi, filter chart, dan modal transaksi sehingga preview terasa hidup tanpa menunggu API.
- Menyediakan view Overview, Transactions, Budget, Accounts, Reports, Insights, dan Settings dengan konten yang sesuai konteks workspace.
- Menyimpan route manifest statis di `client/public/manus-routes.json` untuk route aplikasi saat ini.
- Mempertahankan server dan database terkelola yang sudah dipilih; backend starter siap menjadi tempat prosedur transaksi, akun, dan workspace persisten di iterasi berikutnya.
- Menjalankan diagnostics TypeScript host-managed, `pnpm check`, `pnpm test`, dan build produksi sebelum checkpoint.

## Desain
### Design Movement
**Quiet fintech / editorial dashboard**: perpaduan dashboard finansial enterprise yang presisi dengan nuansa editorial yang hangat. Antarmuka terasa tenang, dewasa, dan premium tanpa memakai gradien berlebihan atau ornamen dekoratif yang tidak membantu keputusan.

### Core Principles
1. **Signal over noise** — angka penting punya kontras dan hierarki kuat; detail sekunder diredam.
2. **Calm confidence** — teal gelap sebagai jangkar kepercayaan, lime sebagai aksen tindakan, dan surface hangat agar tidak terasa seperti spreadsheet dingin.
3. **Progressive density** — desktop kaya informasi, mobile mengalir dalam kartu bertumpuk tanpa kehilangan konteks.
4. **Actionable clarity** — setiap ringkasan mengarah ke tindakan: tambah transaksi, lihat laporan, cek tagihan, atau review insight.

### Color Philosophy
- **Deep ink `#10251F`**: warna signature untuk sidebar, angka utama, dan rasa stabil.
- **Mint `#DDF6EA` / jade `#1E8A63`**: pertumbuhan, kesehatan cash flow, dan status positif.
- **Citrus `#D9F66A`**: aksen kepemilikan LynnZz; hanya dipakai pada CTA utama dan highlight terpilih.
- **Paper `#F7F8F5` dan white**: latar netral lembut yang membuat data mudah dipindai.
- **Coral `#E78767`**: sinyal pengeluaran atau risiko, digunakan hemat agar tetap informatif.

### Layout Paradigm
Split-shell navigation: sidebar gelap yang menetap di desktop menjadi jangkar orientasi, sedangkan canvas utama memakai komposisi asimetris—headline dan KPI di atas, chart lebar di kiri, panel keputusan di kanan, lalu tabel transaksi sebagai baseline. Pada mobile sidebar berubah menjadi top bar dan navigasi horizontal yang dapat digeser.

### Signature Elements
- Mark monogram `L` dengan titik citrus sebagai penanda brand.
- Label angka berformat tabular dan eyebrow uppercase untuk membedakan metadata dari keputusan.
- Mini progress rails dengan ujung bulat dan chip status yang konsisten untuk budget, goal, dan tagihan.

### Interaction Philosophy
Interaksi harus terasa ringan dan tidak mengganggu fokus. Workspace dan halaman berubah instan; filter periode dan chart memakai active state yang jelas; aksi tambah transaksi membuka modal ringkas dengan field minimum; pencarian menyaring transaksi tanpa reload; tombol yang belum terhubung ke backend memberi feedback lokal yang jujur.

### Animation
Gunakan transisi 160–220ms untuk hover, active state, modal, dan pergantian workspace. Kartu masuk dengan fade-up kecil hanya saat pertama tampil. Hindari animasi berulang pada angka finansial dan hindari parallax; data harus terasa stabil dan dapat dipercaya.

### Typography System
Gunakan `DM Sans` untuk seluruh UI karena bentuknya humanist namun rapi; angka memakai `font-variant-numeric: tabular-nums`. Hierarki: 12px eyebrow uppercase dengan tracking 0.14em, 14px metadata, 16px body, 24px section title, 34–42px hero metric. Weight 500 untuk label, 600 untuk CTA, 700 untuk KPI.

### Brand Essence
**LynnZz Finance membantu pemilik hidup dan bisnis melihat uang dengan lebih tenang, lalu bergerak dengan lebih yakin.**
Personality: **tenang, tajam, suportif**.

### Brand Voice
Headlines berbicara langsung, spesifik, dan memberi rasa kendali. CTA berupa kata kerja yang jelas.
- “Buat uangmu lebih mudah dibaca.”
- “Satu tampilan untuk keputusan yang lebih cepat.”

### Wordmark & Logo
Wordmark lowercase `lynnzz` dengan bentuk `z` ganda yang rapat sebagai ritme visual; mark-nya berupa huruf `L` geometris dengan titik citrus kecil di sudut kanan atas. Mark tampil di sidebar dan modal sebagai anchor visual.

### Signature Brand Color
**LynnZz Citrus `#D9F66A`** — aksen hijau-lime lembut yang membedakan brand dari fintech biru generik, sekaligus menyiratkan energi, progres, dan optimisme yang terukur.

## Struktur proyek
- `client/src/App.tsx`: shell dashboard, state interaksi, data demo personal/bisnis, komponen KPI/chart/table/modal.
- `client/src/index.css`: token warna, layout, responsive behavior, table, charts, modal, dan motion.
- `client/public/manus-routes.json`: deklarasi route halaman yang disajikan.
- `server/`: starter Express/tRPC tetap dipertahankan untuk API dan persistence berikutnya.
- `drizzle/`: migration/schema starter untuk fondasi database.
- `plan.md` dan `TODO.md`: keputusan produk/desain dan acceptance outcomes.

## Batasan material
Tidak ada kredensial eksternal atau asset dekoratif yang diperlukan untuk dashboard internal. Data yang tampil adalah data demo lokal dan perlu diganti dengan prosedur server/database pada iterasi persistence. Backend/server/database sudah aktif di konfigurasi WebDev; publikasi akan mengikuti checkpoint setelah build valid.
