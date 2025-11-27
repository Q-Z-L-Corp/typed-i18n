// -------------------------
// Types
// -------------------------
export type Language = string;

export type JSONValue =
	| string
	| number
	| boolean
	| null
	| JSONObject
	| JSONArray;

export interface JSONObject {
	[key: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> {}

// -------------------------
// Resource definitions (legacy - kept for backward compatibility)
// -------------------------
export const defineResource = <T extends JSONObject>(
	lang: Language,
	translation: T,
) => ({ lang, translation }) as const;

export function defineTranslations<Ref extends JSONObject>(
	...resources: {
		lang: Language;
		translation: Ref;
	}[]
): { [K in (typeof resources)[number]["lang"] as Language]: Ref } {
	return Object.assign(
		{},
		...resources.map((r) => ({ [r.lang]: r.translation })),
	);
}

// -------------------------
// Module definitions (modern API)
// -------------------------
export interface I18nModule<
	Namespace extends string = string,
	Reference extends JSONObject = JSONObject,
> {
	namespace: Namespace;
	translations: Record<string, Reference>;
}

/**
 * Define a translation module with type-safe locale validation.
 *
 * **REQUIRED**: You MUST explicitly provide the reference type generic parameter.
 * This ensures all locale files are validated against the same structure at compile time.
 *
 * @example
 * // ✅ CORRECT - Explicit reference type
 * const dashboard = defineModule('dashboard')<typeof dashboardEn>({
 *   en: dashboardEn,
 *   fr: dashboardFr  // Validated to match dashboardEn structure
 * });
 *
 * // ❌ WRONG - Missing reference type
 * const dashboard = defineModule('dashboard')({
 *   en: dashboardEn,
 *   fr: dashboardFr  // No compile-time validation! Runtime warning shown
 * });
 *
 * @param namespace - The module namespace (e.g., 'common', 'dashboard')
 * @returns A function that accepts translations and returns an I18nModule
 *
 * @remarks
 * If the reference type is not provided and locale structures don't match,
 * a detailed runtime warning will be logged to the console showing the differences.
 */
export function defineModule<const Namespace extends string>(
	namespace: Namespace,
) {
	return <Reference extends JSONObject>(
		translations: Reference extends JSONObject
			? Record<string, Reference>
			: never,
	): I18nModule<Namespace, Reference> => {
		// Runtime validation to warn when reference type is not explicitly provided
		// This helps catch structure mismatches at runtime when compile-time checks are bypassed
		const locales = Object.keys(translations);
		if (locales.length > 1) {
			const compareStructure = (obj1: any, obj2: any, path = ""): string[] => {
				const errors: string[] = [];
				const keys1 = new Set(Object.keys(obj1 || {}));
				const keys2 = new Set(Object.keys(obj2 || {}));

				// Check for missing keys
				for (const key of keys1) {
					if (!keys2.has(key)) {
						errors.push(`Missing key in locale: ${path}${key}`);
					} else if (
						typeof obj1[key] === "object" &&
						obj1[key] !== null &&
						typeof obj2[key] === "object" &&
						obj2[key] !== null &&
						!Array.isArray(obj1[key]) &&
						!Array.isArray(obj2[key])
					) {
						// Recursively check nested objects
						errors.push(
							...compareStructure(obj1[key], obj2[key], `${path}${key}.`),
						);
					}
				}

				for (const key of keys2) {
					if (!keys1.has(key)) {
						errors.push(`Extra key in locale: ${path}${key}`);
					}
				}

				return errors;
			};

			const reference = Object.values(translations)[0];
			const referenceLocale = locales[0];

			for (let i = 1; i < locales.length; i++) {
				const currentLocale = locales[i];
				const current = Object.values(translations)[i];
				const errors = compareStructure(reference, current);

				if (errors.length > 0) {
					console.warn(
						`[defineModule] Warning: Module '${namespace}' has structural differences between locales.\n` +
							`Reference locale: '${referenceLocale}', comparing with: '${currentLocale}'\n` +
							`Differences:\n  - ${errors.join("\n  - ")}\n` +
							`\nTo enable compile-time validation, provide an explicit reference type:\n` +
							`defineModule('${namespace}')<typeof ${referenceLocale}Json>({ ... })`,
					);
					break; // Only show warning once
				}
			}
		}
		return { namespace, translations };
	};
}

// -------------------------
// Typed key-path utilities
// -------------------------
type IsRecord<T> = T extends Record<string, any> ? true : false;
type Join<
	K extends string | number,
	P extends string | number,
> = `${K & string}${"" extends P ? "" : "."}${P & string}`;
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

type _Paths<T, D extends number> = [D] extends [never]
	? never
	: T extends Record<string, infer V>
		? {
				[K in Extract<keyof T, string>]: IsRecord<T[K]> extends true
					? K | Join<K, _Paths<T[K], Prev[D]>>
					: K;
			}[Extract<keyof T, string>]
		: "";

export type Paths<T> = _Paths<T, 9>;

export type Params = Record<string, string | number | boolean>;

// -------------------------
// Module path utilities
// -------------------------
/**
 * Extract all valid translation keys from modules, including namespace prefix.
 * E.g., 'common.hello' | 'common.goodbye' | 'dashboard.title'
 */
export type ModuleKeys<TModules extends Record<string, I18nModule>> = {
	[K in keyof TModules]: TModules[K] extends I18nModule<
		infer NS,
		infer Reference
	>
		? `${NS & string}.${Paths<Reference>}`
		: never;
}[keyof TModules];

/**
 * Extract locale type from modules
 */
export type LocalesFromModules<TModules extends Record<string, I18nModule>> =
	keyof TModules[keyof TModules]["translations"] & string;

// -------------------------
// I18n function (modern module-based API)
// -------------------------
export interface I18nOptions<TModules extends Record<string, I18nModule>> {
	/** Current active locale */
	locale: LocalesFromModules<TModules>;
	/** Fallback locale when translation is missing */
	fallbackLocale?: LocalesFromModules<TModules>;
	/** Translation modules */
	modules: TModules;
}

export interface I18nInstance<TModules extends Record<string, I18nModule>> {
	/** Translate a key with optional parameters */
	t: <K extends ModuleKeys<TModules>>(key: K, params?: Params) => string;
	/** Get current locale */
	getLocale: () => LocalesFromModules<TModules>;
	/** Change current locale */
	setLocale: (locale: LocalesFromModules<TModules>) => void;
	/**
	 * Add a new module dynamically. Returns a new instance with updated types.
	 *
	 * ⚠️ IMPORTANT: The original instance reference won't have updated types.
	 * You MUST use the returned instance to get type safety for the new module.
	 *
	 * @example
	 * // ✅ CORRECT - Use returned instance
	 * const i18n2 = i18n.addModule(settingsModule);
	 * i18n2.t('settings.theme'); // Fully typed!
	 *
	 * @example
	 * // ❌ WRONG - Original instance loses type safety
	 * i18n.addModule(settingsModule);
	 * i18n.t('settings.theme'); // Type error!
	 *
	 * @remarks
	 * This is a TypeScript limitation - variable types cannot be widened through
	 * mutation. For React apps, store the i18n instance in Context and update it
	 * when adding modules.
	 */
	addModule: <NS extends string, Ref extends JSONObject>(
		module: I18nModule<NS, Ref>,
	) => I18nInstance<TModules & Record<NS, I18nModule<NS, Ref>>>;
	/** Get all available locales */
	getLocales: () => LocalesFromModules<TModules>[];
}

/**
 * Create a type-safe i18n instance with module support.
 *
 * @example
 * const i18n = createI18n({
 *   locale: 'en',
 *   fallbackLocale: 'en',
 *   modules: { common, dashboard }
 * });
 *
 * i18n.t('common.hello');           // "Hello"
 * i18n.t('dashboard.title');        // "Dashboard"
 * i18n.setLocale('fr');
 * i18n.t('common.hello');           // "Bonjour"
 */
export function createI18n<TModules extends Record<string, I18nModule>>(
	options: I18nOptions<TModules>,
): I18nInstance<TModules> {
	let currentLocale = options.locale;
	const fallbackLocale = options.fallbackLocale;
	const modules: Record<string, I18nModule> = { ...options.modules };

	function getFromPath(obj: any, path: string) {
		if (!path) return undefined;
		const parts = path.split(".");
		let cur = obj;
		for (const p of parts) {
			if (cur == null) return undefined;
			cur = cur[p];
		}
		return cur;
	}

	function interpolate(template: string, params?: Params) {
		if (!params) return template;
		return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, key) => {
			const v = params[key.trim()];
			return v == null ? "" : String(v);
		});
	}

	function t(key: string, params?: Params): string {
		// Split namespace.key
		const firstDotIndex = key.indexOf(".");
		if (firstDotIndex === -1) return key; // No namespace

		const namespace = key.slice(0, firstDotIndex);
		const translationKey = key.slice(firstDotIndex + 1);

		const module = modules[namespace];
		if (!module) return key;

		// Try current locale
		let translation = module.translations[currentLocale];
		let value = getFromPath(translation, translationKey);

		// Fallback to fallback locale
		if (value == null && fallbackLocale && fallbackLocale !== currentLocale) {
			translation = module.translations[fallbackLocale];
			value = getFromPath(translation, translationKey);
		}

		if (typeof value === "string") return interpolate(value, params);
		if (value == null) return key;
		return String(value);
	}

	function getLocale() {
		return currentLocale;
	}

	function setLocale(locale: string) {
		currentLocale = locale;
	}

	function addModule<NS extends string, Ref extends JSONObject>(
		module: I18nModule<NS, Ref>,
	): I18nInstance<TModules & Record<NS, I18nModule<NS, Ref>>> {
		modules[module.namespace] = module;
		// Return the same instance but with updated types
		return instance as any;
	}

	function getLocales(): string[] {
		const localesSet = new Set<string>();
		for (const module of Object.values(modules)) {
			for (const locale of Object.keys(module.translations)) {
				localesSet.add(locale);
			}
		}
		return Array.from(localesSet);
	}

	const instance = {
		t,
		getLocale,
		setLocale,
		addModule,
		getLocales,
	} as I18nInstance<TModules>;

	return instance;
}

// -------------------------
// Legacy I18n function (kept for backward compatibility)
// -------------------------
export function createI18nLegacy<
	TTranslations extends Record<string, JSONObject>,
>(translations: TTranslations) {
	type Locale = keyof TTranslations & string;
	type Segments = TTranslations[Locale];
	type Key = Paths<Segments>;

	function getFromPath(obj: any, path: string) {
		if (!path) return undefined;
		const parts = path.split(".");
		let cur = obj;
		for (const p of parts) {
			if (cur == null) return undefined;
			cur = cur[p];
		}
		return cur;
	}

	function interpolate(template: string, params?: Params) {
		if (!params) return template;
		return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, key) => {
			const v = params[key.trim()];
			return v == null ? "" : String(v);
		});
	}

	function t<L extends Locale, K extends Paths<TTranslations[L]>>(
		locale: L,
		key: K,
		params?: Params,
	): string {
		const seg = getFromPath(translations[locale], String(key));
		if (typeof seg === "string") return interpolate(seg, params);
		if (seg == null) return String(key);
		return String(seg);
	}

	function localeObj<L extends Locale>(locale: L): TTranslations[L] {
		return translations[locale];
	}

	return { t, localeObj } as const;
}

// -------------------------
// Merge multiple translations
// -------------------------
export function mergeTranslations<T extends Record<string, JSONObject>>(
	...transList: T[]
): T {
	return Object.assign({}, ...transList);
}

export function mergeTranslationModules<T extends Record<string, any>>(
	...modules: T[]
): T {
	return Object.assign({}, ...modules);
}
