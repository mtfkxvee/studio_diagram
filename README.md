# Diagram Studio

Prototype app Frappe untuk bikin diagram (flowchart dulu, org chart/ERD nanti) langsung di
dalam ERPNext. Beda dari sekadar embed draw.io: node di canvas bisa dilink ke record ERP asli
(Item, Warehouse, Employee, dst) dan otomatis nampilin data terbaru record itu setiap dibuka —
bukan gambar statis yang basi begitu data aslinya berubah.

## Struktur

- `diagram_studio/diagram_studio/diagram_studio/doctype/diagram/` — Doctype utama.
  `canvas_json` nyimpen nodes+edges (format React Flow). Field `references` (child table)
  di-generate otomatis dari `canvas_json` tiap kali disimpan (lihat `diagram.py:sync_references`),
  supaya bisa query "diagram mana aja yang mereferensikan record X" tanpa parse JSON.
- `diagram_studio/diagram_studio/diagram_studio/doctype/diagram_reference/` — child table di atas.
- `diagram_studio/diagram_studio/diagram_studio/page/diagram_studio/` — halaman custom di desk
  ERPNext (`/app/diagram-studio`) yang mount React app.
- `frontend/` — source React + React Flow. Di-build terpisah (Vite), hasilnya ditaruh di
  `diagram_studio/diagram_studio/public/js/diagram_studio.bundle.js`.

## Cara kerja "hidup"-nya

Node bertipe `linked` cuma nyimpen `{reference_doctype, reference_name}`. Setiap kali diagram
dibuka, frontend manggil `Diagram.get_node_live_data` (whitelisted method, hormat permission
ERPNext) buat ambil title/gambar terbaru record itu. Kalau data Employee/Item/dst berubah di
modul lain, diagram otomatis ikut berubah tanpa perlu diedit manual.

Belum ada sinkronisasi dua arah (diagram nulis balik ke record ERP) — sengaja, biar risikonya
kecil dulu. Itu langkah lanjutan kalau use-case ini kepake beneran.

## Build frontend

```bash
cd frontend
npm install
npm run build
```

Ini nulis ke `../diagram_studio/diagram_studio/public/js/diagram_studio.bundle.js` (path relatif
di dalam scaffold app, sebelum di-copy ke bench).

## Instalasi ke bench (BELUM dilakukan — ini action di server, wajib konfirmasi eksplisit dulu)

Langkah-langkah standar Frappe (dijalankan di server ERPNext, bukan dari sini):

```bash
bench get-app diagram_studio /path/to/diagram_studio   # dari lokasi app ini di-copy ke bench
bench --site erp.x-sha.id install-app diagram_studio
bench build --app diagram_studio
bench --site erp.x-sha.id migrate
bench restart   # atau supervisorctl restart, tergantung setup
```

Sesuai aturan akses server di project ini: setiap command di atas mengubah state server produksi
(install app baru, migrate schema, restart service) — jangan dijalankan tanpa persetujuan
eksplisit dari Lutpi per langkah, dan dicatat di `docs/server-access.md` setelah dieksekusi.

## Yang belum ada (sengaja, buat jaga scope MVP)

- Export ke PNG/SVG.
- Sinkronisasi dua arah (edit diagram -> update record ERP).
- Custom shape/ikon per doctype (masih generic box + badge nama doctype).
- Permission granular per diagram (saat ini: siapa aja yang bisa akses ERPNext bisa
  baca/tulis semua Diagram — role "All" punya create+write). Perlu ditinjau sebelum dipakai
  serius, terutama kalau nanti ada diagram yang isinya sensitif.
