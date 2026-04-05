import {
	defineConfig,
	type UserConfig,
	type PluginOption,
	type ConfigEnv,
} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

const pwaConfig: Partial<VitePWAOptions> = {
	registerType: "autoUpdate",
	includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
	manifest: {
		name: "KOSH POS",
		short_name: "KOSH",
		description: "Advanced Point of Sale System for KOSH",
		theme_color: "#000000",
		icons: [
			{ src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
			{ src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
			{
				src: "pwa-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any maskable",
			},
		],
	},
	workbox: {
		runtimeCaching: [
			{
				urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
				handler: "CacheFirst",
				options: {
					cacheName: "google-fonts-cache",
					expiration: {
						maxEntries: 10,
						maxAgeSeconds: 60 * 60 * 24 * 365,
					},
					cacheableResponse: { statuses: [0, 200] },
				},
			},
		],
	},
};

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
	const isAnalyze = mode === "analyze";

	return {
		server: {
			allowedHosts: ["https://cpc183c5-5173.inc1.devtunnels.ms/"],
		},
		build: {
			minify: "terser",
			terserOptions: {
				compress: {
					drop_console: true,
					drop_debugger: true,
				},
			},
			sourcemap: false,
			reportCompressedSize: true,
			chunkSizeWarningLimit: 500,
			rollupOptions: {
				onwarn(warning, warn) {
					if (
						warning.code === "SOURCEMAP_ERROR" &&
						warning.message.includes("@zxing")
					) {
						return;
					}
					warn(warning);
				},
				output: {
					manualChunks: {
						"react-vendor": ["react", "react-dom", "react-router-dom"],
						"query-vendor": ["@tanstack/react-query"],
						"animation-vendor": ["framer-motion"],
						"ui-vendor": ["@kosh/ui"],
						"state-vendor": ["zustand"],
						"scanner-vendor": ["@zxing/browser"],
					},
					chunkFileNames: "assets/js/[name]-[hash].js",
					entryFileNames: "assets/js/[name]-[hash].js",
					assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
				} as any, 
			},
		},
		optimizeDeps: {
			include: ["react", "react-dom", "react-router-dom"],
			exclude: ["@zxing/browser"],
		},
		plugins: [
			react(),
			tailwindcss(),
			VitePWA(pwaConfig),
			...(isAnalyze
				? [
						visualizer({
							open: true,
							gzipSize: true,
							brotliSize: true,
							filename: "dist/stats.html",
						}),
					]
				: []),
		] satisfies PluginOption[],
	};
});
