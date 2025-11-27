import {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
	type ReactNode,
} from "react";
import type {
	I18nInstance,
	I18nModule,
	ModuleKeys,
	LocalesFromModules,
	Params,
} from "@qzl/typed-i18n";

// -------------------------
// Context
// -------------------------
interface I18nContextValue<TModules extends Record<string, I18nModule>> {
	i18n: I18nInstance<TModules>;
	locale: LocalesFromModules<TModules>;
	setLocale: (locale: LocalesFromModules<TModules>) => void;
}

const I18nContext = createContext<I18nContextValue<any> | null>(null);

// -------------------------
// Provider
// -------------------------
interface I18nProviderProps<TModules extends Record<string, I18nModule>> {
	i18n: I18nInstance<TModules>;
	children: ReactNode;
}

export function I18nProvider<TModules extends Record<string, I18nModule>>({
	i18n,
	children,
}: I18nProviderProps<TModules>) {
	const [locale, setLocaleState] = useState<LocalesFromModules<TModules>>(
		i18n.getLocale(),
	);

	const setLocale = useCallback(
		(newLocale: LocalesFromModules<TModules>) => {
			i18n.setLocale(newLocale);
			setLocaleState(newLocale);
		},
		[i18n],
	);

	const value = useMemo(
		() => ({ i18n, locale, setLocale }),
		[i18n, locale, setLocale],
	);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// -------------------------
// useTranslation Hook
// -------------------------
export interface UseTranslationResult<
	TModules extends Record<string, I18nModule>,
> {
	t: (key: ModuleKeys<TModules>, params?: Params) => string;
	locale: LocalesFromModules<TModules>;
}

export function useTranslation<
	TModules extends Record<string, I18nModule>,
>(): UseTranslationResult<TModules> {
	const context = useContext(I18nContext);

	if (!context) {
		throw new Error("useTranslation must be used within I18nProvider");
	}

	return {
		t: context.i18n.t,
		locale: context.locale,
	};
}

// -------------------------
// useLocale Hook
// -------------------------
export interface UseLocaleResult<TModules extends Record<string, I18nModule>> {
	locale: LocalesFromModules<TModules>;
	setLocale: (locale: LocalesFromModules<TModules>) => void;
	locales: LocalesFromModules<TModules>[];
}

export function useLocale<
	TModules extends Record<string, I18nModule>,
>(): UseLocaleResult<TModules> {
	const context = useContext(I18nContext);

	if (!context) {
		throw new Error("useLocale must be used within I18nProvider");
	}

	const locales = useMemo(
		() => context.i18n.getLocales(),
		[context.i18n],
	) as LocalesFromModules<TModules>[];

	return {
		locale: context.locale,
		setLocale: context.setLocale,
		locales,
	};
}

// -------------------------
// useI18n Hook (access full instance)
// -------------------------
export function useI18n<TModules extends Record<string, I18nModule>>() {
	const context = useContext(I18nContext);

	if (!context) {
		throw new Error("useI18n must be used within I18nProvider");
	}

	return context.i18n;
}
