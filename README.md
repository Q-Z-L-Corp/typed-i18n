# @qzl/typed-i18n

A zero-dependency, TypeScript-first library for typed, multi-file translations. The library uses TypeScript's type inference to derive translation keys and structure from imported JSON files. It enforces shape compatibility between language files at compile time.
 
## Features

- Multi-file per language structure supported via `defineResource`/`defineTranslations`.
- Compile-time shape validation: languages must share identical translation object shape.
- Typed `t(locale, key, params?)` with autocomplete for translation keys.
- Zero runtime dependencies.

## Quick start (example)

```ts
import { defineResource, defineTranslations, createI18n } from '@qzl/typed-i18n';
import en from './locales/en/common.json';
import fr from './locales/fr/common.json';

const tr = defineTranslations(
    defineResource('en', en),
    defineResource('fr', fr)
);

const i18n = createI18n(tr);
console.log(i18n.t('en', 'common.ok'));
```