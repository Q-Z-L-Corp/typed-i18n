# @qzl/typed-i18n-vue

Vue 3 bindings for `@qzl/typed-i18n` with full TypeScript support.

## Installation

```bash
pnpm add @qzl/typed-i18n @qzl/typed-i18n-vue
```

## Usage

### Plugin API (Recommended)

```typescript
import { createApp } from 'vue';
import { createI18n, defineModule } from '@qzl/typed-i18n';
import { createI18nPlugin } from '@qzl/typed-i18n-vue';
import App from './App.vue';

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

// Install plugin
const app = createApp(App);
app.use(createI18nPlugin({ i18n }));
app.mount('#app');
```

### In Components

```vue
<script setup lang="ts">
import { useI18n } from '@qzl/typed-i18n-vue';

const { t, locale, setLocale, locales } = useI18n();
</script>

<template>
  <div>
    <h1>{{ t('common.hello') }}</h1>
    <p>Current locale: {{ locale }}</p>
    
    <select :value="locale" @change="setLocale($event.target.value)">
      <option v-for="loc in locales" :key="loc" :value="loc">
        {{ loc }}
      </option>
    </select>
  </div>
</template>
```

### Global Property

You can also use `$t` directly in templates:

```vue
<template>
  <h1>{{ $t('common.hello') }}</h1>
  <p>{{ $t('common.greeting', { name: 'World' }) }}</p>
</template>
```

### Provide/Inject Pattern (Alternative)

If you prefer not to use the plugin:

```vue
<script setup lang="ts">
import { provideI18n } from '@qzl/typed-i18n-vue';

// In root component
provideI18n(i18n);
</script>
```

```vue
<script setup lang="ts">
import { useI18n } from '@qzl/typed-i18n-vue';

// In child components
const { t } = useI18n();
</script>
```

## API

### `createI18nPlugin(options)`

Creates a Vue plugin for i18n.

**Options:**
- `i18n` - The i18n instance created with `createI18n()`

### `useI18n()`

Composable that returns translation and locale management.

**Returns:**
- `t(key, params?)` - Translate function (fully typed)
- `locale` - Computed ref of current locale
- `setLocale(locale)` - Change locale (triggers reactivity)
- `locales` - Computed ref of all available locales
- `i18n` - Full i18n instance

### `provideI18n(i18n)` / `injectI18n()`

Alternative provide/inject pattern if you don't want to use the plugin.

## Features

✅ **Reactive** - Automatic updates when locale changes  
✅ **Full Type Safety** - All translation keys are typed  
✅ **Vue 3 Composition API** - Built with modern Vue patterns  
✅ **Global Property** - Use `$t` in templates  
✅ **Tree Shakeable** - Only import what you use  

## License

MIT
