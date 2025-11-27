import { defineModule, createI18n } from "../../src";

import en from "./en.json";
import fr from "./fr.json";

// Define a translation module with type validation
// All locales must match the reference type (typeof en)
const common = defineModule("basic")<typeof en>({
	en,
	fr, // TypeScript validates fr matches en's structure
});

// Create i18n instance with modern API
const i18n = createI18n({
	locale: "en",
	fallbackLocale: "en",
	modules: { common },
});

// Use translations - no locale parameter needed!
console.log(i18n.t("basic.common.ok")); // "OK"
console.log(i18n.t("basic.dashboard.title")); // "Dashboard"
console.log(i18n.t("basic.dashboard.stats.clicks", { count: 5 })); // "5 clicks"

// Change locale dynamically
i18n.setLocale("fr");
console.log(i18n.t("basic.common.ok")); // "D'accord"
console.log(i18n.t("basic.dashboard.title")); // "Tableau de bord"
console.log(i18n.t("basic.dashboard.stats.clicks", { count: 5 })); // "5 clics"

// Add modules dynamically (useful for code-splitting)
// addModule returns a NEW typed instance with the added module
const settings = defineModule("settings")<{ theme: string; language: string }>({
	en: { theme: "Theme", language: "Language" },
	fr: { theme: "Thème", language: "Langue" },
});

const i18n2 = i18n.addModule(settings);
// Now fully typed! No 'as any' needed
console.log(i18n2.t("settings.theme")); // "Thème" (current locale is 'fr')
console.log(i18n2.t("basic.common.ok")); // Still works: "D'accord"

// Get available locales
console.log(i18n2.getLocales()); // ['en', 'fr']
