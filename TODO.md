

## Auth & database

- [x] Pengguna dapat mendaftar dengan nama, email valid, dan password minimal 8 karakter; password disimpan sebagai hash scrypt dan password hash tidak dikirim ke browser.
- [x] Pengguna dapat login dengan email/password, tetap memiliki opsi Login Manus, serta dapat masuk sebagai tamu.
- [x] Session user dan guest tersimpan pada database `auth_sessions`, memiliki expiry, menggunakan cookie `HttpOnly; SameSite=None; Secure`, dan dapat diakhiri melalui logout.
- [x] Database `users` menyimpan identitas akun email dan provider autentikasinya; migration auth tersimpan di folder `drizzle/`.
