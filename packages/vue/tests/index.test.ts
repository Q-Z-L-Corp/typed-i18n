import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { defineModule, createI18n } from "@qzlcorp/typed-i18n";
import { createI18nPlugin, useI18n, provideI18n, injectI18n } from "../src/index";

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

describe("createI18nPlugin", () => {
	it("installs plugin and provides i18n context", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const plugin = createI18nPlugin({ i18n });

		const TestComponent = defineComponent({
			setup() {
				const { t, locale } = useI18n();
				return () =>
					h("div", [
						h("p", { "data-testid": "greeting" }, t("common.hello")),
						h("p", { "data-testid": "locale" }, locale.value),
					]);
			},
		});

		const wrapper = mount(TestComponent, {
			global: {
				plugins: [plugin],
			},
		});

		expect(wrapper.find('[data-testid="greeting"]').text()).toBe("Hello");
		expect(wrapper.find('[data-testid="locale"]').text()).toBe("en");
	});

	it("provides global $t property", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const plugin = createI18nPlugin({ i18n });

		const TestComponent = defineComponent({
			template: '<div><p data-testid="greeting">{{ $t("common.hello") }}</p></div>',
		});

		const wrapper = mount(TestComponent, {
			global: {
				plugins: [plugin],
			},
		});

		expect(wrapper.find('[data-testid="greeting"]').text()).toBe("Hello");
	});

	it("throws error when useI18n is used without plugin", () => {
		const TestComponent = defineComponent({
			setup() {
				expect(() => {
					useI18n();
				}).toThrow("useI18n must be used within an app that has the i18n plugin installed");
				return () => h("div", "test");
			},
		});

		// Suppress console warnings
		const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		mount(TestComponent);

		consoleSpy.mockRestore();
	});
});

describe("useI18n composable", () => {
	it("returns translation function and reactive locale", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const plugin = createI18nPlugin({ i18n });

		const TestComponent = defineComponent({
			setup() {
				const { t, locale } = useI18n();
				return () =>
					h("div", [
						h("p", { "data-testid": "greeting" }, t("common.hello")),
						h("p", { "data-testid": "locale" }, locale.value),
					]);
			},
		});

		const wrapper = mount(TestComponent, {
			global: {
				plugins: [plugin],
			},
		});

		expect(wrapper.find('[data-testid="greeting"]').text()).toBe("Hello");
		expect(wrapper.find('[data-testid="locale"]').text()).toBe("en");
	});

	it("supports parameter interpolation", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const plugin = createI18nPlugin({ i18n });

		const TestComponent = defineComponent({
			setup() {
				const { t } = useI18n();
				return () => h("p", { "data-testid": "greeting" }, t("common.greeting", { name: "Vue" }));
			},
		});

		const wrapper = mount(TestComponent, {
			global: {
				plugins: [plugin],
			},
		});

		expect(wrapper.find('[data-testid="greeting"]').text()).toBe("Hello Vue");
	});

	it("re-renders components when locale changes", async () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const plugin = createI18nPlugin({ i18n });

		const TestComponent = defineComponent({
			setup() {
				const { t, locale, setLocale } = useI18n();
				return () =>
					h("div", [
						h("p", { "data-testid": "greeting" }, t("common.hello")),
						h("p", { "data-testid": "locale" }, locale.value),
						h(
							"button",
							{
								"data-testid": "change-locale",
								onClick: () => setLocale("fr" as any),
							},
							"Change to French",
						),
					]);
			},
		});

		const wrapper = mount(TestComponent, {
			global: {
				plugins: [plugin],
			},
		});

		expect(wrapper.find('[data-testid="greeting"]').text()).toBe("Hello");
		expect(wrapper.find('[data-testid="locale"]').text()).toBe("en");

		await wrapper.find('[data-testid="change-locale"]').trigger("click");
		await nextTick();

		expect(wrapper.find('[data-testid="greeting"]').text()).toBe("Bonjour");
		expect(wrapper.find('[data-testid="locale"]').text()).toBe("fr");
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

		const plugin = createI18nPlugin({ i18n });

		const TestComponent = defineComponent({
			setup() {
				const { t } = useI18n();
				return () =>
					h("div", [
						h("p", { "data-testid": "common" }, t("common.hello")),
						h("p", { "data-testid": "dashboard" }, t("dashboard.title")),
						h("p", { "data-testid": "stats" }, t("dashboard.stats.users", { count: 5 })),
					]);
			},
		});

		const wrapper = mount(TestComponent, {
			global: {
				plugins: [plugin],
			},
		});

		expect(wrapper.find('[data-testid="common"]').text()).toBe("Hello");
		expect(wrapper.find('[data-testid="dashboard"]').text()).toBe("Dashboard");
		expect(wrapper.find('[data-testid="stats"]').text()).toBe("5 users");
	});

	it("provides access to full i18n instance", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const plugin = createI18nPlugin({ i18n });

		const TestComponent = defineComponent({
			setup() {
				const { i18n: i18nInstance, locales } = useI18n();
				return () =>
					h("div", [
						h("p", { "data-testid": "locale-count" }, locales.value.length.toString()),
						h("p", { "data-testid": "current" }, i18nInstance.getLocale()),
					]);
			},
		});

		const wrapper = mount(TestComponent, {
			global: {
				plugins: [plugin],
			},
		});

		expect(wrapper.find('[data-testid="locale-count"]').text()).toBe("2");
		expect(wrapper.find('[data-testid="current"]').text()).toBe("en");
	});
});

describe("provideI18n and injectI18n", () => {
	it("provides and injects i18n context using provide/inject pattern", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const ChildComponent = defineComponent({
			setup() {
				const { t, locale, locales } = injectI18n();
				return () =>
					h("div", [
						h("p", { "data-testid": "greeting" }, t("common.hello")),
						h("p", { "data-testid": "locale" }, locale.value),
						h("p", { "data-testid": "locale-count" }, locales.value.length.toString()),
					]);
			},
		});

		const ParentComponent = defineComponent({
			setup() {
				provideI18n(i18n);
				return () => h(ChildComponent);
			},
		});

		const wrapper = mount(ParentComponent);

		expect(wrapper.find('[data-testid="greeting"]').text()).toBe("Hello");
		expect(wrapper.find('[data-testid="locale"]').text()).toBe("en");
		expect(wrapper.find('[data-testid="locale-count"]').text()).toBe("2");
	});
});

describe("Dynamic module loading", () => {
	it("allows adding modules dynamically", async () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const plugin = createI18nPlugin({ i18n });

		const TestComponent = defineComponent({
			setup() {
				const { t, i18n: i18nInstance } = useI18n();

				// Add dashboard module dynamically
				const dashboard = defineModule("dashboard")<typeof dashboardEn>({
					en: dashboardEn,
					fr: dashboardFr,
				});

				i18nInstance.addModule(dashboard);

				return () =>
					h("div", [
						h("p", { "data-testid": "common" }, t("common.hello")),
						h("p", { "data-testid": "dashboard" }, t("dashboard.title" as any)),
					]);
			},
		});

		const wrapper = mount(TestComponent, {
			global: {
				plugins: [plugin],
			},
		});

		expect(wrapper.find('[data-testid="common"]').text()).toBe("Hello");
		expect(wrapper.find('[data-testid="dashboard"]').text()).toBe("Dashboard");
	});
});

describe("Fallback locale", () => {
	it("works with fallback locale when translation not available", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "de", // German not available
			fallbackLocale: "en",
			modules: { common },
		});

		const plugin = createI18nPlugin({ i18n });

		const TestComponent = defineComponent({
			setup() {
				const { t } = useI18n();
				return () => h("p", { "data-testid": "greeting" }, t("common.hello"));
			},
		});

		const wrapper = mount(TestComponent, {
			global: {
				plugins: [plugin],
			},
		});

		// Should fallback to English
		expect(wrapper.find('[data-testid="greeting"]').text()).toBe("Hello");
	});
});

describe("Global $t property", () => {
	it("allows using $t in template", () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const plugin = createI18nPlugin({ i18n });

		const TestComponent = defineComponent({
			template: `
				<div>
					<p data-testid="hello">{{ $t("common.hello") }}</p>
					<p data-testid="greeting">{{ $t("common.greeting", { name: "Vue" }) }}</p>
				</div>
			`,
		});

		const wrapper = mount(TestComponent, {
			global: {
				plugins: [plugin],
			},
		});

		expect(wrapper.find('[data-testid="hello"]').text()).toBe("Hello");
		expect(wrapper.find('[data-testid="greeting"]').text()).toBe("Hello Vue");
	});

	it("$t reflects locale changes", async () => {
		const common = defineModule("common")<typeof commonEn>({
			en: commonEn,
			fr: commonFr,
		});

		const i18n = createI18n({
			locale: "en",
			modules: { common },
		});

		const plugin = createI18nPlugin({ i18n });

		const TestComponent = defineComponent({
			setup() {
				const { setLocale, locale } = useI18n();
				return { setLocale, locale };
			},
			template: `
				<div>
					<p data-testid="greeting" :key="locale">{{ $t("common.hello") }}</p>
					<button data-testid="change" @click="setLocale('fr')">Change</button>
				</div>
			`,
		});

		const wrapper = mount(TestComponent, {
			global: {
				plugins: [plugin],
			},
		});

		expect(wrapper.find('[data-testid="greeting"]').text()).toBe("Hello");

		await wrapper.find('[data-testid="change"]').trigger("click");
		await nextTick();

		expect(wrapper.find('[data-testid="greeting"]').text()).toBe("Bonjour");
	});
});
