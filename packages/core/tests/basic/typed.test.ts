import { describe, it, expect, vi } from "vitest";
import {
	defineModule,
	createI18n,
	createI18nLegacy,
	defineResource,
	defineTranslations,
} from "../../src";

import en from "./en.json";
import fr from "./fr.json";

describe("typed-i18n modern API", () => {
	it("can create typed translations with modules", () => {
		// Define module with type validation
		const common = defineModule("common")<typeof en>({
			en,
			fr,
		});

		const i18n = createI18n({
			locale: "en",
			fallbackLocale: "en",
			modules: { common },
		});

		expect(i18n.t("common.common.ok")).toBe("OK");
		expect(i18n.t("common.dashboard.stats.clicks", { count: 3 })).toBe(
			"3 clicks",
		);

		// Change locale
		i18n.setLocale("fr");
		expect(i18n.t("common.common.ok")).toBe("D'accord");
		expect(i18n.t("common.dashboard.stats.clicks", { count: 3 })).toBe(
			"3 clics",
		);
	});

	it("supports fallback locale", () => {
		const partial = defineModule("test")<{ hello: string }>({
			en: { hello: "Hello" },
			fr: { hello: "Bonjour" },
		});

		const i18n = createI18n({
			locale: "de",
			fallbackLocale: "en",
			modules: { test: partial },
		});

		// Should fallback to English
		expect(i18n.t("test.hello")).toBe("Hello");
	});

	it("supports multiple modules with full type safety", () => {
		const common = defineModule("common")<typeof en>({
			en,
			fr,
		});

		const settings = defineModule("settings")<{ title: string; theme: string }>(
			{
				en: { title: "Settings", theme: "Theme" },
				fr: { title: "Paramètres", theme: "Thème" },
			},
		);

		// Define all modules upfront for full type safety
		const i18n = createI18n({
			locale: "en",
			modules: { common, settings },
		});

		expect(i18n.t("common.common.ok")).toBe("OK");
		expect(i18n.t("settings.title")).toBe("Settings");
		expect(i18n.t("settings.theme")).toBe("Theme");

		i18n.setLocale("fr");
		expect(i18n.t("settings.title")).toBe("Paramètres");
	});

	it("supports dynamic module addition with type safety", () => {
		const common = defineModule("common")<typeof en>({
			en,
			fr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		// Add module dynamically and get new typed instance
		const settings = defineModule("settings")<{ title: string }>({
			en: { title: "Settings" },
			fr: { title: "Paramètres" },
		});

		const i18n2 = i18n.addModule(settings);

		// Both old and new modules are typed!
		expect(i18n2.t("common.common.ok")).toBe("OK");
		expect(i18n2.t("settings.title")).toBe("Settings");

		i18n2.setLocale("fr");
		expect(i18n2.t("settings.title")).toBe("Paramètres");
	});

	it("can get available locales", () => {
		const common = defineModule("common")<typeof en>({
			en,
			fr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const locales = i18n.getLocales();
		expect(locales).toContain("en");
		expect(locales).toContain("fr");
	});

	it("shows runtime warning when reference type is not provided and structures mismatch", () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		// Create mismatched structures without explicit type
		const mismatched = defineModule("test")({
			en: { hello: "Hello", extra: "Extra" },
			fr: { hello: "Bonjour" }, // Missing 'extra' key
		});

		// Should have warned
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining("structural differences"),
		);

		warnSpy.mockRestore();
	});
});

describe("typed-i18n legacy API", () => {
	it("can create typed translations and t()", () => {
		const tr = defineTranslations<typeof en>(
			defineResource("en", en),
			defineResource("fr", fr),
		);
		const i18n = createI18nLegacy(tr);
		i18n.localeObj("en").dashboard.stats.clicks;
		expect(i18n.t("en", "common.ok")).toBe("OK");
		expect(i18n.t("fr", "common.ok")).toBe("D'accord");
		expect(i18n.t("en", "dashboard.stats.clicks", { count: 3 })).toBe(
			"3 clicks",
		);
		expect(i18n.t("fr", "dashboard.stats.clicks", { count: 3 })).toBe(
			"3 clics",
		);
	});
});
