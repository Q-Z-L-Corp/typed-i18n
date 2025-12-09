import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			"@qzlcorp/typed-i18n": path.resolve(__dirname, "../core/src/index.ts"),
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
	},
});
