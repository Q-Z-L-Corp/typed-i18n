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
// Resource definitions
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
// I18n function
// -------------------------
export function createI18n<TTranslations extends Record<string, JSONObject>>(
	translations: TTranslations,
) {
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
