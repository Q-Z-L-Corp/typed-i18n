import { createI18n, defineModule } from "@qzl/typed-i18n";
import en from "./locales/en.json";
import zh from "./locales/zh.json";
import es from "./locales/es.json";

// Define the app module with typed translations
const app = defineModule("app")<typeof en>({
	en,
	zh,
	es,
});

const modules = { app };

// Create i18n instance with the app module
export const i18n = createI18n({
	locale: "en",
	fallbackLocale: "en",
	modules,
});

export type I18nModules = typeof modules;
export type I18n = typeof i18n;
export type Locale = "en" | "zh" | "es";
