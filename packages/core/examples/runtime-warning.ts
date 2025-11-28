/**
 * This example demonstrates the runtime warning when reference type is not provided
 * and locale structures don't match.
 *
 * Run with: npx tsx examples/runtime-warning.ts
 */

import { defineModule } from "../src";

console.log("=== Example: Missing reference type with mismatched structures ===\n");

// ❌ WRONG - No reference type provided, structures don't match
const mismatched = defineModule("example")({
	en: {
		hello: "Hello",
		goodbye: "Goodbye",
		nested: {
			welcome: "Welcome",
		},
	},
	fr: {
		hello: "Bonjour",
		// Missing 'goodbye' key
		nested: {
			welcome: "Bienvenue",
			extra: "Extra key", // Extra key not in English
		},
	},
});

console.log("\n✅ To fix this, provide an explicit reference type:");
console.log("const example = defineModule('example')<typeof enJson>({ en: enJson, fr: frJson });");
