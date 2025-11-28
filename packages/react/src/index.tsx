import {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
	useRef,
	type ReactNode,
} from "react";
import type {
	I18nInstance,
	I18nModule,
	ModuleKeys,
	LocalesFromModules,
	Params,
} from "@qzl/typed-i18n";

type ModuleRecord = Record<string, I18nModule>;
type EmptyModules = Record<never, I18nModule>;

// -------------------------
// Context
// -------------------------
interface I18nContextValue<TModules extends Record<string, I18nModule>> {
	i18n: I18nInstance<TModules>;
	locale: LocalesFromModules<TModules>;
	setLocale: (locale: LocalesFromModules<TModules>) => void;
	registerModules: (modules: ModuleRecord | undefined) => void;
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
	const [instance, setInstance] = useState<I18nInstance<TModules>>(i18n);
	const [locale, setLocaleState] = useState<LocalesFromModules<TModules>>(i18n.getLocale());
	const loadedNamespacesRef = useRef<Set<string>>(new Set());

	const setLocale = useCallback(
		(newLocale: LocalesFromModules<TModules>) => {
			instance.setLocale(newLocale);
			setLocaleState(newLocale);
		},
		[instance],
	);

	const registerModules = useCallback((modules: ModuleRecord | undefined) => {
		if (!modules) return;
		setInstance((current) => {
			let next = current;
			let changed = false;
			for (const module of Object.values(modules)) {
				if (loadedNamespacesRef.current.has(module.namespace)) {
					continue;
				}
				loadedNamespacesRef.current.add(module.namespace);
				next = next.addModule(module);
				changed = true;
			}
			return changed ? (next as typeof current) : current;
		});
	}, []);

	const value = useMemo(
		() => ({ i18n: instance, locale, setLocale, registerModules }),
		[instance, locale, setLocale, registerModules],
	);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// -------------------------
// useTranslation Hook
// -------------------------
export interface UseTranslationResult<TModules extends Record<string, I18nModule>> {
	t: (key: ModuleKeys<TModules>, params?: Params) => string;
	locale: LocalesFromModules<TModules>;
}

export function useTranslation<
	TModules extends Record<string, I18nModule>,
	TDynamic extends ModuleRecord = EmptyModules,
>(modules?: TDynamic): UseTranslationResult<TModules & TDynamic> {
	const context = useContext(I18nContext);

	if (!context) {
		throw new Error("useTranslation must be used within I18nProvider");
	}

	const typedContext = context as I18nContextValue<TModules & TDynamic>;
	const { registerModules } = context;

	useEffect(() => {
		registerModules(modules);
	}, [modules, registerModules]);

	return {
		t: typedContext.i18n.t,
		locale: typedContext.locale,
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

	const typedContext = context as I18nContextValue<TModules>;

	const locales = useMemo(
		() => typedContext.i18n.getLocales(),
		[typedContext.i18n],
	) as LocalesFromModules<TModules>[];

	return {
		locale: typedContext.locale,
		setLocale: typedContext.setLocale,
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

	return (context as I18nContextValue<TModules>).i18n;
}
