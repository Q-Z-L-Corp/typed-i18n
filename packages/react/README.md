# @qzl/typed-i18n-react

React bindings for `@qzl/typed-i18n` with full TypeScript support.

## Installation

```bash
pnpm add @qzl/typed-i18n @qzl/typed-i18n-react
```

## Usage

### Important: Preserve Key Type Safety

To get static type errors for incorrect translation keys you MUST pass your module type (or use a pre-bound wrapper hook). Without the generic, `t()` falls back to a loose pattern like ```${string}.${string}``` and invalid keys will not error at compile time.

```tsx
// i18n.ts
const app = defineModule('app')<typeof enApp>({ en: enApp, fr: frApp });
export const i18n = createI18n({ locale: 'en', fallbackLocale: 'en', modules: { app } });
export type I18nModules = { app: typeof app };

// Component: GOOD (strict key union)
const { t } = useTranslation<I18nModules>();
t('app.title');           // OK
t('app.missing');         // ❌ Type error at compile time

// Component: WEAK (no generic) – do NOT use this form if you want key checking
const { t: tLoose } = useTranslation();
tLoose('app.missing');    // ✅ Compiles (no static safety)
```

Recommended ergonomic wrapper so you never forget the generic:

```tsx
// i18n-hooks.ts
export const useAppTranslation = () => useTranslation<I18nModules>();
export const useAppLocale = () => useLocale<I18nModules>();
export const useAppI18n = () => useI18n<I18nModules>();

// Component
const { t } = useAppTranslation();
```

If you later add modules dynamically, you can widen the type:
```tsx
const dashboard = defineModule('dashboard')<typeof enDashboard>({ en: enDashboard });
const updated = useAppI18n().addModule(dashboard);
// For immediate strict typing in this scope:
const { t: tWithDashboard } = useTranslation<I18nModules & { dashboard: typeof dashboard }>();
```

### Setup Provider

```tsx
import { createI18n, defineModule } from '@qzl/typed-i18n';
import { I18nProvider } from '@qzl/typed-i18n-react';

// Define your modules
const common = defineModule('common')<typeof enCommon>({
  en: enCommon,
  fr: frCommon,
});

// Create i18n instance
const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  modules: { common },
});

// Wrap your app
function App() {
  return (
    <I18nProvider i18n={i18n}>
      <YourApp />
    </I18nProvider>
  );
}
```

### Use in Components

```tsx
import { useTranslation, useLocale } from '@qzl/typed-i18n-react';

function MyComponent() {
  const { t, locale } = useTranslation();
  const { setLocale, locales } = useLocale();

  return (
    <div>
      <h1>{t('common.hello')}</h1>
      <p>Current locale: {locale}</p>
      
      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        {locales.map((loc) => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>
    </div>
  );
}
```

## API

### `I18nProvider`

Provider component that makes i18n instance available to all child components.

**Props:**
- `i18n` - The i18n instance created with `createI18n()`
- `children` - React children

### `useTranslation()`

Returns translation function and current locale.

**Returns:**
- `t(key, params?)` - Translate function (fully typed when generic provided)
- `locale` - Current active locale

⚠️ Pass your module type generic (e.g. `useTranslation<I18nModules>()`) for strict key unions.

### `useLocale()`

Returns locale management functions.

**Returns:**
- `locale` - Current active locale
- `setLocale(locale)` - Change locale (triggers re-renders)
- `locales` - Array of all available locales

### `useI18n()`

Returns the full i18n instance for advanced use cases.

**Returns:**
- Full `I18nInstance` with all methods

## Features

✅ **Automatic Re-renders** - Components re-render when locale changes  
✅ **Full Type Safety** - All translation keys are typed  
✅ **React 18 Ready** - Built with modern React patterns  
✅ **Small Bundle** - Minimal overhead  
✅ **Tree Shakeable** - Only import what you use  

## License

MIT
