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
	Fragment,
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
	TranslateOptionsWithObjects,
	TranslateOptionsWithoutObjects,
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
	t: I18nInstance<TModules>["t"];
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
	/** Translation key (optional if using children as translation string) */
	i18nKey?: ModuleKeys<TModules>;
	/** Interpolation values */
	values?: Params;
	/** Custom components to use for tags in translation */
	components?: Record<string, ReactElement>;
	/** Whether to include default HTML components (strong, em, etc.) */
	defaults?: boolean;
	/** Children to use as translation string if i18nKey is not provided */
	children?: ReactNode;
}

/**
 * Trans component for translating JSX with embedded components.
 *
 * @example
 * // With i18nKey
 * // Translation: "Hello <strong>{{name}}</strong>, click <link>here</link>"
 * <Trans
 *   i18nKey="welcome"
 *   values={{ name: "John" }}
 *   components={{ link: <a href="/profile" /> }}
 * />
 *
 * @example
 * // With children
 * <Trans values={{ name: "John" }} components={{ link: <a href="/profile" /> }}>
 *   Hello <strong>{{name}}</strong>, click <link>here</link>
 * </Trans>
 */
export function Trans<TModules extends Record<string, I18nModule>>({
	i18nKey,
	values = {},
	components = {},
	defaults = true,
	children,
}: TransProps<TModules>) {
	const context = useContext(I18nContext);

	if (!context) {
		throw new Error("Trans must be used within I18nProvider");
	}

	const { i18n } = context as I18nContextValue<TModules>;

	// Merge default components with custom ones
	const allComponents = defaults ? { ...DEFAULT_COMPONENTS, ...components } : components;

	// Get the translation string - either from i18nKey or children
	let translation: string;

	if (i18nKey) {
		// Use translation from i18nKey
		translation = i18n.t(i18nKey, values) as string;
	} else if (children) {
		// Extract string from children
		const childrenString = extractTranslationFromChildren(children);
		// Apply interpolation if values are provided
		translation =
			Object.keys(values).length > 0 ? interpolateString(childrenString, values) : childrenString;
	} else {
		// Neither i18nKey nor children provided
		return null;
	}

	// Parse and render the translation
	const elements = useMemo(
		() => parseTranslation(translation, allComponents),
		[translation, allComponents],
	);

	return <>{elements}</>;
}

/**
 * Interpolate values into a string
 */
function interpolateString(str: string, values: Params): string {
	return str.replace(/\{\{(\s*\w+\s*)\}\}/g, (_, key) => {
		const value = values[key.trim()];
		return value == null ? "" : String(value);
	});
}

/**
 * Extract a translation string from React children.
 * Converts React elements to HTML-like string representation.
 * Text nodes are preserved as-is, elements are converted to <tagName>...</tagName>.
 */
function extractTranslationFromChildren(children: ReactNode): string {
	if (!children) {
		return "";
	}

	const extractNode = (node: ReactNode): string => {
		if (typeof node === "string" || typeof node === "number") {
			return String(node);
		}

		if (Array.isArray(node)) {
			return node.map(extractNode).join("");
		}

		if (isValidElement(node)) {
			// Handle React Fragments - extract their children without wrapping
			if (node.type === Fragment) {
				return extractNode(node.props.children);
			}

			const tagName =
				typeof node.type === "string"
					? node.type
					: typeof node.type === "function" && node.type.name
						? node.type.name.toLowerCase()
						: "component";

			const childContent = extractNode(node.props.children);

			// Extract attributes (particularly href for <a> tags)
			const props = node.props;
			let attrs = "";
			if (props && typeof props === "object") {
				// Only extract href for now (can be extended for other attributes)
				if (props.href) {
					attrs = ` href="${props.href}"`;
				}
			}

			return `<${tagName}${attrs}>${childContent}</${tagName}>`;
		}

		return "";
	};

	return extractNode(children).trim();
}

/**
 * Parse translation string and replace HTML tags with React components
 */
function parseTranslation(str: string, components: Record<string, ReactElement>): ReactNode[] {
	const result: ReactNode[] = [];
	let remaining = str;
	let keyCounter = 0;

	// Regex to match opening and closing tags with optional attributes
	// Matches: <tagName>content</tagName> or <tagName attr="value">content</tagName>
	const tagRegex = /<(\w+)(\s[^>]*)?>(.*?)<\/\1>/g;

	let match: RegExpExecArray | null;
	let lastIndex = 0;

	while ((match = tagRegex.exec(str)) !== null) {
		const [fullMatch, tagName, attrs, content] = match;
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

			// Parse attributes from the extracted string
			const additionalProps: Record<string, any> = {};
			if (attrs) {
				// Extract attributes like href="value"
				const attrRegex = /(\w+)="([^"]*)"/g;
				let attrMatch: RegExpExecArray | null;
				while ((attrMatch = attrRegex.exec(attrs)) !== null) {
					const [, attrName, attrValue] = attrMatch;
					additionalProps[attrName] = attrValue;
				}
			}

			// Clone the component with the parsed content and additional props
			result.push(
				cloneElement(
					component,
					{ key: `trans-${keyCounter++}`, ...additionalProps },
					...parsedContent,
				),
			);
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
