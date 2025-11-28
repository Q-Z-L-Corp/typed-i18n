import { useState } from "react";
import { useTranslation, useLocale } from "@qzl/typed-i18n-react";
import type { Locale } from "./i18n";
import "./App.css";

function App() {
	const [count, setCount] = useState(0);
	const { t } = useTranslation();
	const { locale, setLocale } = useLocale();

	const locales: Locale[] = ["en", "zh", "es"];
	const localeNames: Record<Locale, string> = {
		en: "English",
		zh: "中文",
		es: "Español",
	};

	return (
		<div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
			{/* Header */}
			<header style={{ textAlign: "center", marginBottom: "2rem" }}>
				<h1>{t("app.app.title")}</h1>
				<p style={{ color: "#888" }}>{t("app.app.subtitle")}</p>
			</header>

			{/* Language Switcher */}
			<div style={{ marginBottom: "2rem", textAlign: "center" }}>
				<label style={{ marginRight: "1rem", fontWeight: "bold" }}>
					{t("app.actions.switchLanguage")}:
				</label>
				{locales.map((loc) => (
					<button
						key={loc}
						onClick={() => setLocale(loc)}
						style={{
							margin: "0 0.5rem",
							padding: "0.5rem 1rem",
							backgroundColor: locale === loc ? "#646cff" : "#f0f0f0",
							color: locale === loc ? "white" : "#333",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
							fontWeight: locale === loc ? "bold" : "normal",
						}}
					>
						{localeNames[loc]}
					</button>
				))}
			</div>

			{/* Features Section */}
			<div
				style={{
					marginBottom: "2rem",
					padding: "1.5rem",
					background: "#f9f9f9",
					borderRadius: "8px",
				}}
			>
				<h2>{t("app.features.title")}</h2>
				<ul style={{ lineHeight: "1.8" }}>
					<li>✅ {t("app.features.basicTranslation")}</li>
					<li>✅ {t("app.features.interpolation")}</li>
					<li>✅ {t("app.features.pluralization")}</li>
					<li>✅ {t("app.features.localeSwitch")}</li>
					<li>✅ {t("app.features.typeSupport")}</li>
				</ul>
			</div>

			{/* Greeting Examples */}
			<div
				style={{
					marginBottom: "2rem",
					padding: "1.5rem",
					background: "#fff",
					border: "1px solid #e0e0e0",
					borderRadius: "8px",
				}}
			>
				<h3>{t("app.greeting.hello")}</h3>
				<p>{t("app.greeting.welcome", { name: "Developer" })}</p>
				<p>{t("app.greeting.welcomeBack", { name: "User", count: 5 })}</p>
			</div>

			{/* Counter Demo */}
			<div
				className="card"
				style={{
					marginBottom: "2rem",
					padding: "1.5rem",
					background: "#fff",
					border: "1px solid #e0e0e0",
					borderRadius: "8px",
					textAlign: "center",
				}}
			>
				<h3>{t("app.counter.label")}</h3>
				<p style={{ fontSize: "1.2rem", margin: "1rem 0" }}>{t("app.counter.value", { count })}</p>
				<p style={{ fontStyle: "italic", color: "#666" }}>{t("app.counter.clicks", { count })}</p>
				<div style={{ marginTop: "1.5rem" }}>
					<button
						onClick={() => setCount((count) => count + 1)}
						style={{
							padding: "0.75rem 1.5rem",
							margin: "0 0.5rem",
							backgroundColor: "#646cff",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
							fontSize: "1rem",
						}}
					>
						{t("app.actions.incrementCounter")}
					</button>
					<button
						onClick={() => setCount(0)}
						style={{
							padding: "0.75rem 1.5rem",
							margin: "0 0.5rem",
							backgroundColor: "#f44336",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
							fontSize: "1rem",
						}}
					>
						{t("app.actions.reset")}
					</button>
				</div>
			</div>

			{/* Description */}
			<div
				style={{
					marginTop: "2rem",
					padding: "1rem",
					background: "#fffbf0",
					border: "1px solid #ffe082",
					borderRadius: "8px",
				}}
			>
				<p style={{ margin: 0, lineHeight: "1.6" }}>{t("app.description")}</p>
			</div>

			{/* Debug Info */}
			<div
				style={{
					marginTop: "2rem",
					padding: "1rem",
					background: "#f5f5f5",
					borderRadius: "4px",
					fontSize: "0.9rem",
					color: "#666",
				}}
			>
				<strong>Current Locale:</strong> {locale}
				<br />
				<strong>Package:</strong> @qzl/typed-i18n-react
			</div>
		</div>
	);
}

export default App;
