# Diagram Studio

App Frappe untuk bikin diagram (flowchart, brainstorming bebas, dst) langsung di dalam ERPNext.
Beda dari sekadar embed draw.io: node di canvas *bisa* dilink ke record ERP asli (Item,
Warehouse, Employee, dst) dan otomatis nampilin data terbaru record itu setiap dibuka — tapi
linking itu opsional. Diagram brainstorming murni (shape + teks bebas, tanpa nyentuh doctype
apa pun) sama validnya dan tidak butuh referensi ERP sama sekali.

Sudah terpasang di `erp.x-sha.id` (app `diagram_studio`, halaman `/app/diagram-studio`).

## Struktur

- `diagram_studio/diagram_studio/diagram_studio/doctype/diagram/` — Doctype utama.
  `canvas_json` nyimpen nodes+edges (format React Flow). Field `references` (child table)
  di-generate otomatis dari `canvas_json` tiap kali disimpan (lihat `diagram.py:sync_references`),
  supaya bisa query "diagram mana aja yang mereferensikan record X" tanpa parse JSON. Diagram
  yang nodenya semua freeform (nggak ada yang dilink) ya otomatis child table ini kosong.
- `diagram_studio/diagram_studio/diagram_studio/doctype/diagram_reference/` — child table di atas.
- `diagram_studio/diagram_studio/diagram_studio/page/diagram_studio/` — halaman custom di desk
  ERPNext (`/app/diagram-studio`) yang mount React app.
- `frontend/` — source React + React Flow. Di-build terpisah (Vite), hasilnya ditaruh di
  `diagram_studio/diagram_studio/public/js/diagram_studio.js`.

## Jenis node

- **Shape node** (`ShapeNode.tsx`) — freeform, tidak konek ke doctype apa pun. 4 bentuk (rectangle,
  diamond, ellipse, sticky note), warna bisa dipilih, resizable, dan bisa dihapus lewat toolbar
  yang muncul saat node dipilih. Ini yang dipakai buat brainstorming murni.
- **Linked node** (`LinkedNode.tsx`) — terikat ke satu record ERPNext (`reference_doctype` +
  `reference_name`). Ambil title/gambar terbaru record itu tiap diagram dibuka lewat
  `Diagram.get_node_live_data` (whitelisted method, hormat permission ERPNext). Kalau data
  Employee/Item/dst berubah di modul lain, diagram otomatis ikut berubah tanpa perlu diedit manual.

Belum ada sinkronisasi dua arah (diagram nulis balik ke record ERP) — sengaja, biar risikonya
kecil dulu. Itu langkah lanjutan kalau use-case ini kepake beneran.

## Build frontend

```bash
cd frontend
npm install
npm run build
```

Ini nulis ke `../diagram_studio/diagram_studio/public/js/diagram_studio.js` (path relatif di
dalam scaffold app, sebelum di-push ke GitHub dan di-`get-app` ke bench).

**Penting:** jangan namain file output `*.bundle.js`. Frappe's esbuild pipeline men-scan
`public/js/*.bundle.{js,css,...}` sebagai *source* yang mesti dikompilasi ulang oleh esbuild
bawaannya sendiri, bukan file jadi yang tinggal di-serve — kalau dikasih nama itu, `bench build`
bakal crash (`TypeError: paths[0] must be of type string`). Nama `diagram_studio.js` (tanpa
`.bundle`) bikin bench cukup nge-symlink-nya sebagai static asset biasa.

## Instalasi ke bench (sudah dilakukan di erp.x-sha.id — dicatat di sini buat referensi/reinstall)

```bash
bench get-app --skip-assets diagram_studio https://github.com/mtfkxvee/studio_diagram
bench --site erp.x-sha.id install-app diagram_studio
bench build --app diagram_studio
bench --site erp.x-sha.id migrate
```

Gotcha yang kena waktu instalasi pertama kali (sudah diperbaiki di repo ini, tapi dicatat buat
jaga-jaga kalau install ulang dari awal / bikin app serupa lagi):

1. **`requirements.txt` jangan cantumkan `frappe`.** `uv pip install` gagal resolve kalau app
   custom declare `frappe` sebagai dependency (bentrok sama `pypika` yang di-pin lewat git URL
   di dependency `frappe` sendiri). Frappe sudah otomatis tersedia dari bench.
2. **App wajib punya 3 file ini** di folder python package-nya: `hooks.py`, `modules.txt`, DAN
   `patches.txt` (boleh kosong). `bench.utils.is_frappe_app()` cek ketiganya — kalau
   `patches.txt` nggak ada, bench diam-diam nganggep folder itu bukan app Frappe yang valid, dan
   `sites/apps.txt` nggak pernah kemasukan app-nya (jadi `install-app` selalu gagal dengan "App
   X not in apps.txt" walau foldernya udah ke-clone bener).
3. **`bench get-app` (tanpa `--skip-assets`) mencoba build asset SEBELUM app terdaftar di
   `sites/apps.txt`** kalau appnya baru pertama kali di-clone — bikin esbuild crash karena
   `public_path` app itu belum ada di lookup table-nya. Solusinya: `get-app --skip-assets` dulu,
   baru `install-app` (yang mendaftarkan app ke `sites/apps.txt`), baru `bench build --app <app>`.

Setiap command di atas mengubah state server produksi — kalau mau reinstall/redeploy, tetap
minta konfirmasi eksplisit dulu per langkah sesuai aturan akses server di project ini, dan catat
di `docs/server-access.md`.

## Yang belum ada (sengaja, buat jaga scope MVP)

- Export ke PNG/SVG.
- Sinkronisasi dua arah (edit diagram -> update record ERP).
- Permission granular per diagram (saat ini: siapa aja yang bisa akses ERPNext bisa
  baca/tulis semua Diagram — role "All" punya create+write). Perlu ditinjau sebelum dipakai
  serius, terutama kalau nanti ada diagram yang isinya sensitif.
