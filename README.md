# @qzlcorp/typed-i18n

Type-safe internationalization library with zero dependencies and framework integrations.

## Live Demo

🚀 **[View React Demo](https://typed-i18n.vercel.app/)** - Interactive demo showcasing dynamic module loading, locale switching, and type-safe translations.

## Packages

This is a monorepo containing multiple packages:

- **[@qzlcorp/typed-i18n](./packages/core)** - Core library (zero dependencies)
- **[@qzlcorp/typed-i18n-react](./packages/react)** - React bindings with hooks
- **[@qzlcorp/typed-i18n-vue](./packages/vue)** - Vue 3 bindings with composables

## Demo Apps

- **[React Demo](./apps/react-demo)** - Full React demo showcasing all features

## Features

✅ **100% Type-Safe** - Compile-time validation of all translation keys  
✅ **Zero Dependencies** - Core library has no runtime dependencies  
✅ **Module-Based** - Perfect for code-splitting by feature or route  
✅ **Framework Agnostic** - Use with React, Vue, or vanilla JavaScript  
✅ **Modern API** - Simple, intuitive interface with namespace support  
✅ **Dynamic Loading** - Load translations on-demand  
✅ **Fallback Support** - Automatic fallback to default locale  
✅ **Runtime Validation** - Detailed warnings for structural mismatches  

## Installation

```bash
# Core library only
pnpm add @qzlcorp/typed-i18n

# With React
pnpm add @qzlcorp/typed-i18n @qzlcorp/typed-i18n-react

# With Vue
pnpm add @qzlcorp/typed-i18n @qzlcorp/typed-i18n-vue
```

## Quick Start

### Core Library (Vanilla JS/TS)

```typescript
import { createI18n, defineModule } from '@qzlcorp/typed-i18n';

// Define translation module
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

// Use translations
i18n.t('common.hello'); // "Hello"

// Change locale
i18n.setLocale('fr');
i18n.t('common.hello'); // "Bonjour"
```

### React

```tsx
import { I18nProvider, useTranslation, useLocale } from '@qzlcorp/typed-i18n-react';

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <MyComponent />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t } = useTranslation();
  const { locale, setLocale, locales } = useLocale();
  
  return (
    <div>
      <h1>{t('common.hello')}</h1>
      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        {locales.map((loc) => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>
    </div>
  );
}
```

### Vue

```vue
<script setup lang="ts">
import { useI18n } from '@qzlcorp/typed-i18n-vue';

const { t, locale, setLocale, locales } = useI18n();
</script>

<template>
  <div>
    <h1>{{ t('common.hello') }}</h1>
    <select :value="locale" @change="setLocale($event.target.value)">
      <option v-for="loc in locales" :key="loc" :value="loc">
        {{ loc }}
      </option>
    </select>
  </div>
</template>
```

## Documentation

See individual package READMEs for detailed documentation:
- [Core Library](./packages/core/README.md)
- [React Integration](./packages/react/README.md)
- [Vue Integration](./packages/vue/README.md)

## Development

This is a pnpm monorepo. To work on the packages:

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Clean all packages
pnpm clean
```

### Package Structure

```
typed-i18n/
├── packages/
│   ├── core/           # @qzlcorp/typed-i18n
│   ├── react/          # @qzlcorp/typed-i18n-react
│   └── vue/            # @qzlcorp/typed-i18n-vue
├── pnpm-workspace.yaml
└── package.json
```

## Contributing

Contributions are welcome! Please read the individual package documentation for development guidelines.

## License

MIT © Errong Leng
