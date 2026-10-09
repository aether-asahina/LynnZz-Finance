import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { sql } from "drizzle-orm";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { publicPlatformScript } from "./_core/publicConfig";
import { getDb } from "./db";

// Entry point serverless untuk Vercel.
// Tidak memanggil listen(): Vercel menjalankan app ini sebagai handler (req, res).
// Di-bundle oleh scripts/build-vercel.mjs menjadi .vercel/output/functions/api/index.func.
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));

// Cek cepat setelah deploy: buka /api/health di browser.
app.get("/api/health", async (_req, res) => {
  let database: "ok" | "error" | "not-configured" = "not-configured";
  try {
    const db = await getDb();
    if (db) {
      await db.execute(sql`select 1`);
      database = "ok";
    }
  } catch (error) {
    // Pesan error tidak dikirim ke publik (bisa memuat host/user), cukup di log Vercel.
    console.error("[health] Database error:", error);
    database = "error";
  }
  res.set("Cache-Control", "no-store").status(database === "error" ? 500 : 200).json({ status: "ok", database });
});

app.get("/api/platform/config.js", (_req, res) => {
  res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
});

app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

export default app;
