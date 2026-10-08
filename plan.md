

## Update autentikasi dan persistence
- Menambahkan pendaftaran email dengan nama, email, dan password minimal 8 karakter menggunakan hashing `scrypt`; password hash tidak pernah dikirim ke browser.
- Menambahkan login email/password, Login Manus OAuth yang tetap tersedia, serta Login sebagai tamu.
- Menambahkan cookie `lynnzz_session` dengan `HttpOnly`, `SameSite=None`, dan `Secure` untuk Preview HTTPS; token mentah tidak disimpan di database, hanya SHA-256 hash-nya.
- Menambahkan tabel `auth_sessions` untuk session user/tamu dengan expiry; akun email disimpan pada tabel `users` beserta `passwordHash` dan `authProvider`.
- Logout menghapus session database dan membersihkan cookie aplikasi maupun cookie Manus.
- Data finance pada dashboard masih berupa demo lokal; tabel domain transaksi/workspace dapat ditambahkan berikutnya setelah model data bisnis final disepakati.
