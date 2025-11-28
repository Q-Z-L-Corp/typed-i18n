import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { render, screen } from "@testing-library/react";
import React from "react";
import { defineModule, createI18n } from "@qzlcorp/typed-i18n";
import { I18nProvider, useTranslation, useLocale, useI18n } from "../src/index";

// Test translation data
const commonEn = {
	hello: "Hello",
	goodbye: "Goodbye",
	greeting: "Hello {{name}}",
};

const commonFr = {
	hello: "Bonjour",
	goodbye: "Au revoir",
	greeting: "Bonjour {{name}}",
};

const dashboardEn = {
	title: "Dashboard",
	stats: {
		users: "{{count}} users",
	},
};

const dashboardFr = {
	title: "Tableau de bord",
	stats: {
		users: "{{count}} utilisateurs",
	},
};

describe("I18nProvider", () => {
	it("provides i18n context to child components", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<I18nProvider i18n={i18n}>{children}</I18nProvider>
		);

		const { result } = renderHook(() => useTranslation(), { wrapper });

		expect(result.current.t("common.hello")).toBe("Hello");
		expect(result.current.locale).toBe("en");
	});

	it("throws error when useTranslation is used outside provider", () => {
		// Suppress console.error for this test
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => {
			renderHook(() => useTranslation());
		}).toThrow("useTranslation must be used within I18nProvider");

		consoleSpy.mockRestore();
	});
});

describe("useTranslation", () => {
	it("returns translation function and current locale", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<I18nProvider i18n={i18n}>{children}</I18nProvider>
		);

		const { result } = renderHook(() => useTranslation(), { wrapper });

		expect(result.current.t("common.hello")).toBe("Hello");
		expect(result.current.t("common.greeting", { name: "World" })).toBe("Hello World");
		expect(result.current.locale).toBe("en");
	});

	it("re-renders when locale changes", async () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<I18nProvider i18n={i18n}>{children}</I18nProvider>
		);

		const { result } = renderHook(
			() => {
				const translation = useTranslation();
				const locale = useLocale();
				return { ...translation, ...locale };
			},
			{ wrapper },
		);

		expect(result.current.t("common.hello")).toBe("Hello");
		expect(result.current.locale).toBe("en");

		// Change locale
		act(() => {
			result.current.setLocale("fr");
		});

		await waitFor(() => {
			expect(result.current.locale).toBe("fr");
		});

		expect(result.current.t("common.hello")).toBe("Bonjour");
	});

	it("works with multiple modules", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const dashboard = defineModule("dashboard")<typeof dashboardEn>({
			en: dashboardEn,
			fr: dashboardFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common, dashboard },
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<I18nProvider i18n={i18n}>{children}</I18nProvider>
		);

		const { result } = renderHook(() => useTranslation(), { wrapper });

		expect(result.current.t("common.hello")).toBe("Hello");
		expect(result.current.t("dashboard.title")).toBe("Dashboard");
		expect(result.current.t("dashboard.stats.users", { count: 5 })).toBe("5 users");
	});
});

describe("useLocale", () => {
	it("returns locale management functions", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<I18nProvider i18n={i18n}>{children}</I18nProvider>
		);

		const { result } = renderHook(() => useLocale(), { wrapper });

		expect(result.current.locale).toBe("en");
		expect(result.current.locales).toContain("en");
		expect(result.current.locales).toContain("fr");
	});

	it("changes locale and triggers re-renders", async () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<I18nProvider i18n={i18n}>{children}</I18nProvider>
		);

		const { result } = renderHook(() => useLocale(), { wrapper });

		expect(result.current.locale).toBe("en");

		act(() => {
			result.current.setLocale("fr");
		});

		await waitFor(() => {
			expect(result.current.locale).toBe("fr");
		});
	});
});

describe("useI18n", () => {
	it("returns full i18n instance", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<I18nProvider i18n={i18n}>{children}</I18nProvider>
		);

		const { result } = renderHook(() => useI18n(), { wrapper });

		expect(result.current.t("common.hello")).toBe("Hello");
		expect(result.current.getLocale()).toBe("en");
		expect(result.current.getLocales()).toContain("en");
		expect(result.current.getLocales()).toContain("fr");
	});
});

describe("Dynamic module loading", () => {
	it("maintains type safety when dynamically adding modules", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<I18nProvider i18n={i18n}>{children}</I18nProvider>
		);

		const { result } = renderHook(() => useI18n(), { wrapper });

		// Add dashboard module dynamically
		const dashboard = defineModule("dashboard")<typeof dashboardEn>({
			en: dashboardEn,
			fr: dashboardFr,
		});

		const i18n2 = result.current.addModule(dashboard);

		// Original instance still works
		expect(result.current.t("common.hello")).toBe("Hello");

		// New instance has both modules
		expect(i18n2.t("common.hello")).toBe("Hello");
		expect(i18n2.t("dashboard.title")).toBe("Dashboard");
	});

	it("allows single instance to access dynamically loaded translations", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<I18nProvider i18n={i18n}>{children}</I18nProvider>
		);

		const { result } = renderHook(() => useI18n(), { wrapper });

		// Add module dynamically (mutates the underlying modules)
		const dashboard = defineModule("dashboard")<typeof dashboardEn>({
			en: dashboardEn,
			fr: dashboardFr,
		});

		result.current.addModule(dashboard);

		// Original instance can access new module at runtime
		// (though TypeScript won't know about it without using the returned instance)
		expect(result.current.t("dashboard.title" as any)).toBe("Dashboard");
	});

	it("registers modules via useTranslation without duplicate loads", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const dashboard = defineModule("dashboard")<typeof dashboardEn>({
			en: dashboardEn,
			fr: dashboardFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const addModuleSpy = vi.spyOn(i18n, "addModule");

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<I18nProvider i18n={i18n}>{children}</I18nProvider>
		);

		const { result, rerender } = renderHook(
			() =>
				useTranslation<{ common: typeof common }, { dashboard: typeof dashboard }>({
					dashboard,
				}),
			{ wrapper },
		);

		expect(addModuleSpy).toHaveBeenCalledTimes(1);
		expect(result.current.t("dashboard.title")).toBe("Dashboard");

		rerender();
		expect(addModuleSpy).toHaveBeenCalledTimes(1);
	});
});

describe("Component integration", () => {
	it("re-renders components when locale changes", async () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		function TestComponent() {
			const { t } = useTranslation();
			const { setLocale } = useLocale();

			return (
				<div>
					<p data-testid="greeting">{t("common.hello")}</p>
					<button onClick={() => setLocale("fr")}>Change to French</button>
				</div>
			);
		}

		render(
			<I18nProvider i18n={i18n}>
				<TestComponent />
			</I18nProvider>,
		);

		expect(screen.getByTestId("greeting")).toHaveTextContent("Hello");

		const button = screen.getByText("Change to French");
		act(() => {
			button.click();
		});

		await waitFor(() => {
			expect(screen.getByTestId("greeting")).toHaveTextContent("Bonjour");
		});
	});

	it("supports parameter interpolation in components", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		function TestComponent() {
			const { t } = useTranslation();
			return <p data-testid="greeting">{t("common.greeting", { name: "React" })}</p>;
		}

		render(
			<I18nProvider i18n={i18n}>
				<TestComponent />
			</I18nProvider>,
		);

		expect(screen.getByTestId("greeting")).toHaveTextContent("Hello React");
	});

	it("works with fallback locale", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "de", // German not available
			fallbackLocale: "en",
			modules: { common },
		});

		function TestComponent() {
			const { t } = useTranslation();
			return <p data-testid="greeting">{t("common.hello")}</p>;
		}

		render(
			<I18nProvider i18n={i18n}>
				<TestComponent />
			</I18nProvider>,
		);

		// Should fallback to English
		expect(screen.getByTestId("greeting")).toHaveTextContent("Hello");
	});
});
