# LynnZz Finance Advanced

LynnZz Finance Advanced adalah dashboard keuangan Personal dan Business berbasis React / Express / tRPC / Drizzle.

## Fitur

- Dashboard cash flow, saldo, pemasukan, pengeluaran, budget, tagihan, health score, dan transaksi.
- Workspace Personal dan Business.
- Login Manus OAuth, login email/password, daftar dengan email, login tamu, dan logout.
- Session user/tamu tersimpan di database MySQL dengan cookie aman.

## Development

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build dan serve `dist/index.js` dan `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations.
- `pnpm db:push`: generate dan apply perubahan schema.
- `pnpm check` / `pnpm test`: type check dan test aplikasi.

## Database dan keamanan

Akun email disimpan pada tabel `users`; session disimpan pada tabel `auth_sessions`. Password di-hash dengan `scrypt` dan tidak dikirim ke browser. Token session mentah tidak disimpan di database.

Platform configuration dapat dibaca dan diedit melalui `webdev.config`. Private keys tetap server-side. File `index.html` di root merupakan artefak legacy dari histori repository sebelumnya; aplikasi LynnZz yang aktif berjalan dari entry point `client/index.html` melalui Vite.
