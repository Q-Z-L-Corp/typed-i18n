/**
 * This example demonstrates dynamic module loading with full type safety.
 * Perfect for code-splitting in React apps where each route loads its own translations.
 *
 * Run with: npx tsx examples/dynamic-loading.ts
 */

import { defineModule, createI18n } from "../src";

// Common translations loaded upfront
const common = defineModule("common")<{
	hello: string;
	goodbye: string;
}>({
	en: { hello: "Hello", goodbye: "Goodbye" },
	fr: { hello: "Bonjour", goodbye: "Au revoir" },
});

// Create initial i18n instance with just common module
const i18n = createI18n({
	locale: "en",
	fallbackLocale: "en",
	modules: { common },
});

console.log("=== Initial State ===");
console.log(i18n.t("common.hello")); // "Hello"

// Simulate lazy-loading a dashboard module (e.g., when user navigates to /dashboard)
console.log("\n=== Loading dashboard module dynamically ===");

const dashboard = defineModule("dashboard")<{
	title: string;
	stats: { users: string; revenue: string };
}>({
	en: {
		title: "Dashboard",
		stats: { users: "{{count}} users", revenue: "${{amount}}" },
	},
	fr: {
		title: "Tableau de bord",
		stats: { users: "{{count}} utilisateurs", revenue: "{{amount}} $" },
	},
});

// Add module - returns instance with updated types
// Use new variable to capture the updated type
const i18nWithDashboard = i18n.addModule(dashboard);

// ✅ Now we have full type safety for BOTH modules!
console.log(i18nWithDashboard.t("dashboard.title")); // "Dashboard" - Now fully typed!
console.log(i18nWithDashboard.t("common.hello")); // "Hello"
console.log(i18nWithDashboard.t("dashboard.stats.users", { count: 1234 })); // "1234 users"

// Change locale
i18nWithDashboard.setLocale("fr");
console.log("\n=== After changing locale to French ===");
console.log(i18nWithDashboard.t("dashboard.title")); // "Tableau de bord"
console.log(i18nWithDashboard.t("common.goodbye")); // "Au revoir"

// Simulate loading another module (e.g., settings page)
console.log("\n=== Loading settings module ===");

const settings = defineModule("settings")<{
	title: string;
	theme: string;
}>({
	en: { title: "Settings", theme: "Theme" },
	fr: { title: "Paramètres", theme: "Thème" },
});

// Add another module
const i18nFull = i18nWithDashboard.addModule(settings);

console.log(i18nFull.t("settings.title")); // "Paramètres" (still French)
console.log(i18nFull.t("dashboard.title")); // "Tableau de bord"
console.log(i18nFull.t("common.hello")); // "Bonjour"

console.log("\n✅ All modules fully typed!");
console.log("💡 Tip: Use new variables for each addModule() to preserve type safety");
