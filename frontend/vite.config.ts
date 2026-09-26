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
				entryFileNames: "diagram_studio.bundle.js",
				format: "iife",
				assetFileNames: "diagram_studio.[ext]",
			},
		},
	},
});
