import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider } from "@qzlcorp/typed-i18n-react";
import { i18n } from "./i18n";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<I18nProvider i18n={i18n}>
			<App />
		</I18nProvider>
	</StrictMode>,
);
