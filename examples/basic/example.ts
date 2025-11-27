import { defineResource, defineTranslations } from "../../src";

import en from "./en.json";
import fr from "./fr.json";

const translations = defineTranslations<typeof en>(
	defineResource("fr", fr),
	defineResource("en", en),
);
