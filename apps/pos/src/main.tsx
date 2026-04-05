import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryProvider } from "./providers/QueryProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

// Enable vConsole in development for mobile debugging
if (import.meta.env.DEV) {
	import("vconsole").then(({ default: VConsole }) => {
		new VConsole();
	});
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
			<QueryProvider>
				<App />
			</QueryProvider>
		</GoogleOAuthProvider>
	</StrictMode>,
);
