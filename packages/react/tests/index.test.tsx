import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { render, screen } from "@testing-library/react";
import React from "react";
import { defineModule, createI18n } from "@qzlcorp/typed-i18n";
import { I18nProvider, useTranslation, useLocale, useI18n, Trans } from "../src/index";

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

	it("supports returnObjects option in t function", () => {
		const dashboard = defineModule("dashboard")<typeof dashboardEn>({
			en: dashboardEn,
			fr: dashboardFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { dashboard },
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<I18nProvider i18n={i18n}>{children}</I18nProvider>
		);

		const { result } = renderHook(() => useTranslation(), { wrapper });

		// Get nested object
		const statsObj = result.current.t("dashboard.stats", { returnObjects: true });
		expect(statsObj).toEqual({ users: "{{count}} users" });

		// Regular string still works
		expect(result.current.t("dashboard.title")).toBe("Dashboard");

		// String from nested object with params
		expect(result.current.t("dashboard.stats.users", { count: 5 })).toBe("5 users");
	});

	it("supports both params and options signature", () => {
		const dashboard = defineModule("dashboard")<typeof dashboardEn>({
			en: dashboardEn,
			fr: dashboardFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { dashboard },
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<I18nProvider i18n={i18n}>{children}</I18nProvider>
		);

		const { result } = renderHook(() => useTranslation(), { wrapper });

		// Legacy params
		expect(result.current.t("dashboard.stats.users", { count: 5 })).toBe("5 users");

		// New options with params
		expect(
			result.current.t("dashboard.stats.users", { params: { count: 10 }, returnObjects: false }),
		).toBe("10 users");

		// Options with returnObjects
		const obj = result.current.t("dashboard.stats", { returnObjects: true });
		expect(obj).toEqual({ users: "{{count}} users" });
	});
});

describe("Trans Component", () => {
	it("renders basic HTML tags", () => {
		const messages = defineModule("messages")<{
			welcome: string;
		}>({
			en: {
				welcome: "Hello <strong>World</strong>!",
			},
			fr: {
				welcome: "Bonjour <strong>Monde</strong>!",
			},
		});

		const i18n = createI18n({
			locale: "en",
			modules: { messages },
		});

		render(
			<I18nProvider i18n={i18n}>
				<div data-testid="content">
					<Trans i18nKey="messages.welcome" />
				</div>
			</I18nProvider>,
		);

		const content = screen.getByTestId("content");
		expect(content.textContent).toBe("Hello World!");
		expect(content.querySelector("strong")).toBeTruthy();
		expect(content.querySelector("strong")?.textContent).toBe("World");
	});

	it("renders with interpolation values", () => {
		const messages = defineModule("messages")<{
			greeting: string;
		}>({
			en: {
				greeting: "Hello <strong>{{name}}</strong>, welcome!",
			},
		});

		const i18n = createI18n({
			locale: "en",
			modules: { messages },
		});

		render(
			<I18nProvider i18n={i18n}>
				<div data-testid="content">
					<Trans i18nKey="messages.greeting" values={{ name: "John" }} />
				</div>
			</I18nProvider>,
		);

		const content = screen.getByTestId("content");
		expect(content.textContent).toBe("Hello John, welcome!");
		expect(content.querySelector("strong")?.textContent).toBe("John");
	});

	it("renders with custom components", () => {
		const messages = defineModule("messages")<{
			action: string;
		}>({
			en: {
				action: "Click <link>here</link> to continue",
			},
		});

		const i18n = createI18n({
			locale: "en",
			modules: { messages },
		});

		render(
			<I18nProvider i18n={i18n}>
				<div data-testid="content">
					<Trans
						i18nKey="messages.action"
						components={{
							link: <a href="/next" className="custom-link" />,
						}}
					/>
				</div>
			</I18nProvider>,
		);

		const content = screen.getByTestId("content");
		expect(content.textContent).toBe("Click here to continue");
		const link = content.querySelector("a");
		expect(link).toBeTruthy();
		expect(link?.getAttribute("href")).toBe("/next");
		expect(link?.className).toBe("custom-link");
		expect(link?.textContent).toBe("here");
	});

	it("renders multiple tags", () => {
		const messages = defineModule("messages")<{
			formatted: string;
		}>({
			en: {
				formatted: "This is <strong>bold</strong> and this is <em>italic</em>.",
			},
		});

		const i18n = createI18n({
			locale: "en",
			modules: { messages },
		});

		render(
			<I18nProvider i18n={i18n}>
				<div data-testid="content">
					<Trans i18nKey="messages.formatted" />
				</div>
			</I18nProvider>,
		);

		const content = screen.getByTestId("content");
		expect(content.textContent).toBe("This is bold and this is italic.");
		expect(content.querySelector("strong")?.textContent).toBe("bold");
		expect(content.querySelector("em")?.textContent).toBe("italic");
	});

	it("renders nested tags", () => {
		const messages = defineModule("messages")<{
			nested: string;
		}>({
			en: {
				nested: "This is <strong>bold with <em>italic</em> inside</strong>.",
			},
		});

		const i18n = createI18n({
			locale: "en",
			modules: { messages },
		});

		render(
			<I18nProvider i18n={i18n}>
				<div data-testid="content">
					<Trans i18nKey="messages.nested" />
				</div>
			</I18nProvider>,
		);

		const content = screen.getByTestId("content");
		expect(content.textContent).toBe("This is bold with italic inside.");
		const strong = content.querySelector("strong");
		expect(strong).toBeTruthy();
		expect(strong?.querySelector("em")?.textContent).toBe("italic");
	});

	it("works without default components when defaults=false", () => {
		const messages = defineModule("messages")<{
			text: string;
		}>({
			en: {
				text: "This <strong>won't</strong> be bold",
			},
		});

		const i18n = createI18n({
			locale: "en",
			modules: { messages },
		});

		render(
			<I18nProvider i18n={i18n}>
				<div data-testid="content">
					<Trans i18nKey="messages.text" defaults={false} />
				</div>
			</I18nProvider>,
		);

		const content = screen.getByTestId("content");
		// Without default components, tags should remain as text
		expect(content.textContent).toBe("This <strong>won't</strong> be bold");
		expect(content.querySelector("strong")).toBeNull();
	});

	it("combines interpolation with components", () => {
		const messages = defineModule("messages")<{
			profile: string;
		}>({
			en: {
				profile: "Welcome <strong>{{name}}</strong>, <link>view profile</link>",
			},
		});

		const i18n = createI18n({
			locale: "en",
			modules: { messages },
		});

		render(
			<I18nProvider i18n={i18n}>
				<div data-testid="content">
					<Trans
						i18nKey="messages.profile"
						values={{ name: "Alice" }}
						components={{ link: <a href="/profile" /> }}
					/>
				</div>
			</I18nProvider>,
		);

		const content = screen.getByTestId("content");
		expect(content.textContent).toBe("Welcome Alice, view profile");
		expect(content.querySelector("strong")?.textContent).toBe("Alice");
		expect(content.querySelector("a")?.textContent).toBe("view profile");
	});

	test("Trans component - using children as translation source", () => {
		const i18n = createI18n({
			locale: "en",
			modules: {},
		});

		render(
			<I18nProvider i18n={i18n}>
				<div data-testid="content">
					<Trans>
						Hello <strong>world</strong>
					</Trans>
				</div>
			</I18nProvider>,
		);

		const content = screen.getByTestId("content");
		expect(content.textContent).toBe("Hello world");
		expect(content.querySelector("strong")).toBeTruthy();
		expect(content.querySelector("strong")?.textContent).toBe("world");
	});

	test("Trans component - children with interpolation", () => {
		const i18n = createI18n({
			locale: "en",
			modules: {},
		});

		render(
			<I18nProvider i18n={i18n}>
				<div data-testid="content">
					<Trans values={{ name: "John" }}>
						Hello <strong>{"{{name}}"}</strong>
					</Trans>
				</div>
			</I18nProvider>,
		);

		const content = screen.getByTestId("content");
		expect(content.textContent).toBe("Hello John");
		expect(content.querySelector("strong")).toBeTruthy();
		expect(content.querySelector("strong")?.textContent).toBe("John");
	});

	test("Trans component - children with custom components", () => {
		const i18n = createI18n({
			locale: "en",
			modules: {},
		});

		const CustomTag = ({ children }: { children?: React.ReactNode }) => (
			<span className="custom">{children}</span>
		);

		render(
			<I18nProvider i18n={i18n}>
				<div data-testid="content">
					<Trans components={{ custom: <CustomTag /> }}>
						Hello <custom>world</custom>
					</Trans>
				</div>
			</I18nProvider>,
		);

		const content = screen.getByTestId("content");
		expect(content.textContent).toBe("Hello world");
		expect(content.querySelector(".custom")).toBeTruthy();
		expect(content.querySelector(".custom")?.textContent).toBe("world");
	});

	test("Trans component - i18nKey takes precedence over children", () => {
		const messagesEn = {
			greeting: "Bonjour <strong>monde</strong>",
		};

		const messages = defineModule("messages")<typeof messagesEn>({
			en: messagesEn,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { messages },
		});

		render(
			<I18nProvider i18n={i18n}>
				<div data-testid="content">
					<Trans i18nKey="messages.greeting">
						Hello <strong>world</strong>
					</Trans>
				</div>
			</I18nProvider>,
		);

		const content = screen.getByTestId("content");
		// Should use i18nKey translation, not children
		expect(content.textContent).toBe("Bonjour monde");
		expect(content.querySelector("strong")).toBeTruthy();
		expect(content.querySelector("strong")?.textContent).toBe("monde");
	});
});
