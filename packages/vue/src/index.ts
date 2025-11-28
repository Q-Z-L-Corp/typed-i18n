import { inject, provide, reactive, computed, type InjectionKey, type App } from "vue";
import type {
	I18nInstance,
	I18nModule,
	ModuleKeys,
	LocalesFromModules,
	Params,
} from "@qzl/typed-i18n";

// -------------------------
// Injection Key
// -------------------------
const I18nSymbol: InjectionKey<I18nState<any>> = Symbol("i18n");

interface I18nState<TModules extends Record<string, I18nModule>> {
	i18n: I18nInstance<TModules>;
	locale: LocalesFromModules<TModules>;
}

// -------------------------
// Plugin
// -------------------------
export interface I18nPluginOptions<TModules extends Record<string, I18nModule>> {
	i18n: I18nInstance<TModules>;
}

export function createI18nPlugin<TModules extends Record<string, I18nModule>>(
	options: I18nPluginOptions<TModules>,
) {
	return {
		install(app: App) {
			const state = reactive<I18nState<TModules>>({
				i18n: options.i18n,
				locale: options.i18n.getLocale(),
			});

			app.provide(I18nSymbol, state);

			// Global property
			app.config.globalProperties.$t = (key: ModuleKeys<TModules>, params?: Params) =>
				state.i18n.t(key, params);
		},
	};
}

// -------------------------
// useI18n Composable
// -------------------------
export function useI18n<TModules extends Record<string, I18nModule>>() {
	const state = inject(I18nSymbol);

	if (!state) {
		throw new Error("useI18n must be used within an app that has the i18n plugin installed");
	}

	return {
		t: (key: ModuleKeys<TModules>, params?: Params) => state.i18n.t(key, params),
		locale: computed(() => state.locale),
		setLocale: (locale: LocalesFromModules<TModules>) => {
			state.i18n.setLocale(locale);
			state.locale = locale;
		},
		locales: computed(() => state.i18n.getLocales()),
		i18n: state.i18n,
	};
}

// -------------------------
// Provide/Inject Pattern (Alternative)
// -------------------------
export function provideI18n<TModules extends Record<string, I18nModule>>(
	i18n: I18nInstance<TModules>,
) {
	const state = reactive<I18nState<TModules>>({
		i18n,
		locale: i18n.getLocale(),
	});

	provide(I18nSymbol, state);

	return state;
}

export function injectI18n<TModules extends Record<string, I18nModule>>() {
	return useI18n<TModules>();
}
