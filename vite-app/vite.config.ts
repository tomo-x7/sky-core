import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"#": path.resolve(__dirname, "src"),
		},
	},
	server: { allowedHosts: true, host: true },
	optimizeDeps: { esbuildOptions: { loader: { ".js": "tsx" } } },
});
