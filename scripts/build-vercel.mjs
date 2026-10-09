// Membuat folder .vercel/output (Vercel Build Output API v3) dari:
//   - hasil `vite build` di dist/public  -> .vercel/output/static
//   - server Express + tRPC (server/vercel.ts) -> .vercel/output/functions/api/index.func
// Dijalankan lewat: pnpm build:vercel
import { build } from "esbuild";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

const OUT = ".vercel/output";
const STATIC_SRC = "dist/public";
const FUNCTION_DIR = `${OUT}/functions/api/index.func`;
// Samakan dengan region database. Singapura (sin1) cocok untuk TiDB ap-southeast-1.
const REGION = process.env.LYNNZZ_FUNCTION_REGION || "sin1";

if (!existsSync(`${STATIC_SRC}/index.html`)) {
  console.error(`[build-vercel] ${STATIC_SRC}/index.html tidak ditemukan. Jalankan "vite build" dulu.`);
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(FUNCTION_DIR, { recursive: true });
cpSync(STATIC_SRC, `${OUT}/static`, { recursive: true });

await build({
  entryPoints: ["server/vercel.ts"],
  outfile: `${FUNCTION_DIR}/index.js`,
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  tsconfig: "tsconfig.json", // supaya alias @shared/* terbaca
  legalComments: "none",
  // Vercel butuh handler (req, res) sebagai module.exports, bukan { default }.
  footer: { js: "module.exports = module.exports.default;" },
  logLevel: "info",
});

// package.json root proyek memakai "type": "module", sedangkan bundle di atas berformat CommonJS.
// File ini memastikan index.js di folder function selalu dibaca sebagai CommonJS.
writeFileSync(`${FUNCTION_DIR}/package.json`, JSON.stringify({ type: "commonjs" }) + "\n");

writeFileSync(
  `${FUNCTION_DIR}/.vc-config.json`,
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.js",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
      maxDuration: 15,
      regions: [REGION],
    },
    null,
    2
  ) + "\n"
);

writeFileSync(
  `${OUT}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        // 1. File statis (assets, index.html, api/platform/config.js) dilayani lebih dulu.
        { handle: "filesystem" },
        // 2. Semua /api/* yang bukan file statis masuk ke function Express.
        { src: "^/api/.*$", dest: "/api/index" },
        // 3. Sisanya halaman SPA.
        { src: "^/(?!api/).*$", dest: "/index.html" },
      ],
    },
    null,
    2
  ) + "\n"
);

console.log(`[build-vercel] Selesai: ${OUT} (function region: ${REGION})`);
