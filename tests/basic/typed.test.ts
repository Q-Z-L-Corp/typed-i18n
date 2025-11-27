import { describe, it, expect } from "vitest";
import { defineResource, defineTranslations, createI18n } from "../../src";

import en from "./en.json";
import fr from "./fr.json";

describe("typed-i18n basics", () => {
	it("can create typed translations and t()", () => {
		const tr = defineTranslations<typeof en>(
			defineResource("en", en),
			defineResource("fr", fr),
		);
		const i18n = createI18n(tr);
		i18n.localeObj("en").dashboard.stats.clicks;
		expect(i18n.t("en", "common.ok")).toBe("OK");
		expect(i18n.t("fr", "common.ok")).toBe("D'accord");
		expect(i18n.t("en", "dashboard.stats.clicks", { count: 3 })).toBe(
			"3 clicks",
		);
		expect(i18n.t("fr", "dashboard.stats.clicks", { count: 3 })).toBe(
			"3 clics",
		);
	});
});
