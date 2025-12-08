import {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
	useEffect,
	useRef,
	cloneElement,
	isValidElement,
	type ReactNode,
	type ReactElement,
} from "react";
import type {
	I18nInstance,
	I18nModule,
	ModuleKeys,
	LocalesFromModules,
	Params,
	TranslateOptions,
	JSONValue,
} from "@qzlcorp/typed-i18n";

// Re-export types for convenience
export type { Params, TranslateOptions, JSONValue };

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
	t: {
		(key: ModuleKeys<TModules>, params?: Params): string;
		(key: ModuleKeys<TModules>, options?: TranslateOptions): string | JSONValue;
	};
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

// -------------------------
// Trans Component
// -------------------------

// Default components for basic HTML tags
const DEFAULT_COMPONENTS: Record<string, ReactElement> = {
	strong: <strong />,
	b: <b />,
	em: <em />,
	i: <i />,
	u: <u />,
	br: <br />,
	p: <p />,
	span: <span />,
};

export interface TransProps<TModules extends Record<string, I18nModule>> {
	/** Translation key */
	i18nKey: ModuleKeys<TModules>;
	/** Interpolation values */
	values?: Params;
	/** Custom components to use for tags in translation */
	components?: Record<string, ReactElement>;
	/** Whether to include default HTML components (strong, em, etc.) */
	defaults?: boolean;
}

/**
 * Trans component for translating JSX with embedded components.
 *
 * @example
 * // Translation: "Hello <strong>{{name}}</strong>, click <link>here</link>"
 * <Trans
 *   i18nKey="welcome"
 *   values={{ name: "John" }}
 *   components={{ link: <a href="/profile" /> }}
 * />
 */
export function Trans<TModules extends Record<string, I18nModule>>({
	i18nKey,
	values = {},
	components = {},
	defaults = true,
}: TransProps<TModules>) {
	const context = useContext(I18nContext);

	if (!context) {
		throw new Error("Trans must be used within I18nProvider");
	}

	const { i18n } = context as I18nContextValue<TModules>;

	// Merge default components with custom ones
	const allComponents = defaults ? { ...DEFAULT_COMPONENTS, ...components } : components;

	// Get the translation string
	const translation = i18n.t(i18nKey, values) as string;

	// Parse and render the translation
	const elements = useMemo(
		() => parseTranslation(translation, allComponents),
		[translation, allComponents],
	);

	return <>{elements}</>;
}

/**
 * Parse translation string and replace HTML tags with React components
 */
function parseTranslation(str: string, components: Record<string, ReactElement>): ReactNode[] {
	const result: ReactNode[] = [];
	let remaining = str;
	let keyCounter = 0;

	// Regex to match opening and closing tags with content
	// Matches: <tagName>content</tagName> or <tagName attr="value">content</tagName>
	const tagRegex = /<(\w+)(?:\s[^>]*)?>(.+?)<\/\1>/g;

	let match: RegExpExecArray | null;
	let lastIndex = 0;

	while ((match = tagRegex.exec(str)) !== null) {
		const [fullMatch, tagName, content] = match;
		const matchIndex = match.index;

		// Add text before this tag
		if (matchIndex > lastIndex) {
			const textBefore = str.substring(lastIndex, matchIndex);
			if (textBefore) {
				result.push(textBefore);
			}
		}

		// Get the component for this tag
		const component = components[tagName];

		if (component && isValidElement(component)) {
			// Recursively parse content in case of nested tags
			const parsedContent = parseTranslation(content, components);

			// Clone the component with the parsed content as children
			result.push(cloneElement(component, { key: `trans-${keyCounter++}` }, ...parsedContent));
		} else {
			// If no component found, keep the original text
			result.push(fullMatch);
		}

		lastIndex = tagRegex.lastIndex;
	}

	// Add any remaining text after the last tag
	if (lastIndex < str.length) {
		const textAfter = str.substring(lastIndex);
		if (textAfter) {
			result.push(textAfter);
		}
	}

	return result;
}
