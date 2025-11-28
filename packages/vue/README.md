# @qzl/typed-i18n-vue

Vue 3 bindings for `@qzl/typed-i18n` with full TypeScript support.

## Installation

```bash
pnpm add @qzl/typed-i18n @qzl/typed-i18n-vue
```

## Usage

### Important: Key Type Safety

Translation key type safety depends on providing the reference type when defining a module:

```ts
const common = defineModule('common')<typeof enCommon>({
  en: enCommon,
  fr: frCommon,
}); // ✅ Keys validated at compile time
```

If you omit the generic reference type, Vue runtime still works but invalid keys won’t be caught until runtime warnings appear.

Dynamic module loading: `addModule()` returns a new widened instance. To get types for newly added namespaces in the same scope, use the returned instance.

```ts
const i18n = createI18n({ locale: 'en', modules: { common } });
const dashboard = defineModule('dashboard')<typeof enDashboard>({ en: enDashboard, fr: frDashboard });
const i18n2 = i18n.addModule(dashboard); // widened type
i18n2.t('dashboard.title'); // ✅ Typed
i18n.t('dashboard.title');  // ❌ Type error (original instance)
```

When using the plugin, if you need types for dynamically added modules in existing components, re-provide the updated instance or design your app to mount features after load.

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

// You can optionally narrow to a namespace for stricter key scope:
// const { t } = useI18n();
// const tCommon = ((key: `common.${string}`) => t(key))
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
