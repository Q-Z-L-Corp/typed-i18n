import { defineModule } from "@qzlcorp/typed-i18n";
import en from "../locales/profile/en.json";
import zh from "../locales/profile/zh.json";
import es from "../locales/profile/es.json";

export const profileModule = defineModule("profile")<typeof en>({
	en,
	zh,
	es,
});

export type ProfileModule = typeof profileModule;
