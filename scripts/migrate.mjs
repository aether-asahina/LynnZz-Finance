// Menjalankan migrasi Drizzle (folder ./drizzle) ke database dari DATABASE_URL.
// Aman dijalankan berulang: Drizzle mencatat migrasi yang sudah berjalan di tabel __drizzle_migrations.
// Dipanggil otomatis oleh `pnpm build:vercel`, atau manual: DATABASE_URL="..." node scripts/migrate.mjs
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("[migrate] DATABASE_URL belum diisi, migrasi dilewati.");
  process.exit(0);
}

let connection;
try {
  connection = await mysql.createConnection(url);
  await migrate(drizzle(connection), { migrationsFolder: "./drizzle" });
  console.log("[migrate] Migrasi selesai.");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("[migrate] Gagal:", message);
  console.error("[migrate] Cek DATABASE_URL: host, port, user, password (karakter khusus harus di-URL-encode), dan parameter ssl.");
  process.exitCode = 1;
} finally {
  if (connection) await connection.end().catch(() => {});
}
