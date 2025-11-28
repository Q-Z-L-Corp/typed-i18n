import { defineModule } from "@qzlcorp/typed-i18n";
import en from "../locales/dashboard/en.json";
import zh from "../locales/dashboard/zh.json";
import es from "../locales/dashboard/es.json";

export const dashboardModule = defineModule("dashboard")<typeof en>({
	en,
	zh,
	es,
});

export type DashboardModule = typeof dashboardModule;
