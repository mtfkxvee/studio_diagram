import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Builds one self-contained script that the Frappe page loads via
// frappe.require("diagram_studio.bundle.js"). Output goes straight into the
// app's public/js/ folder, which is what `bench build` (or a raw <script
// src="/assets/diagram_studio/js/...">) serves.
export default defineConfig({
	plugins: [react()],
	build: {
		outDir: "../diagram_studio/public/js",
		emptyOutDir: false,
		rollupOptions: {
			input: "src/main.tsx",
			output: {
				// NOT named *.bundle.js on purpose: Frappe's own esbuild pipeline
				// auto-discovers any public/js/*.bundle.js as a source entry it must
				// compile itself, and chokes on an already-built IIFE. This name keeps
				// it a plain static asset that bench just symlinks into sites/assets.
				entryFileNames: "diagram_studio.js",
				format: "iife",
				assetFileNames: "diagram_studio.[ext]",
			},
		},
	},
});
