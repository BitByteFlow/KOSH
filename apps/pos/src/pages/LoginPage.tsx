import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

declare global {
	interface Window {
		google: any;
	}
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

const LoginPage: React.FC = () => {
	const { loginWithGoogle, isAuthenticated, needsOnboarding } = useAuth();
	const navigate = useNavigate();
	const googleButtonRef = useRef<HTMLDivElement>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleGoogleResponse = useCallback(
		async (response: { credential: string }) => {
			setIsLoading(true);
			try {
				// Decode the JWT token from Google (client-side decode only - not verification)
				const payload = JSON.parse(atob(response.credential.split(".")[1]));
				await loginWithGoogle({
					googleId: payload.sub,
					email: payload.email,
					username: payload.name,
					image: payload.picture,
				});
				// Navigation is handled by the useEffect above
			} catch {
				toast.error("Sign in failed. Please try again.");
			} finally {
				setIsLoading(false);
			}
		},
		[loginWithGoogle],
	);

	const initGoogle = useCallback(() => {
		if (!window.google || !googleButtonRef.current) return;

		window.google.accounts.id.initialize({
			client_id: GOOGLE_CLIENT_ID,
			callback: handleGoogleResponse,
			auto_select: false,
		});

		window.google.accounts.id.renderButton(googleButtonRef.current, {
			type: "standard",
			shape: "pill",
			theme: "filled_blue",
			text: "signin_with",
			size: "large",
			width: 300,
		});
	}, [handleGoogleResponse]);

	useEffect(() => {
		if (isAuthenticated && !needsOnboarding) {
			navigate("/", { replace: true });
		} else if (isAuthenticated && needsOnboarding) {
			navigate("/get-started", { replace: true });
		}
	}, [isAuthenticated, needsOnboarding, navigate]);

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		script.onload = initGoogle;
		document.head.appendChild(script);
		return () => {
			document.head.removeChild(script);
		};
	}, [initGoogle]);

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
			{/* Decorative background */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div className="absolute -top-32 -right-32 w-150 h-150 bg-primary/5 rounded-full blur-3xl" />
				<div className="absolute -bottom-32 -left-32 w-125 h-125 bg-blue-100/80 rounded-full blur-3xl" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-slate-100/40 rounded-full blur-3xl" />
			</div>

			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="relative w-full max-w-md"
			>
				{/* Card */}
				<div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
					{/* Header Band */}
					<div className="h-2 bg-linear-to-r from-primary via-blue-500 to-violet-500" />

					<div className="p-10 flex flex-col items-center">
						{/* Logo */}
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{
								delay: 0.1,
								type: "spring",
								stiffness: 300,
								damping: 20,
							}}
							className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 mb-6"
						>
							<span className="text-3xl font-black text-white leading-none">
								K
							</span>
						</motion.div>

						<h1 className="text-2xl font-black text-slate-900 tracking-tight">
							KOSH POS
						</h1>
						<p className="text-slate-500 text-sm font-medium mt-1 text-center leading-relaxed">
							Sign in to access your cashier dashboard
						</p>

						<div className="my-8 w-full border-t border-slate-100" />

						{/* Google Sign In Button */}
						<AnimatePresence mode="wait">
							{isLoading ? (
								<motion.div
									key="loading"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className="flex flex-col items-center gap-3 py-4"
								>
									<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
									<p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
										Signing in...
									</p>
								</motion.div>
							) : (
								<motion.div
									key="button"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className="flex flex-col items-center gap-4 w-full"
								>
									<div
										ref={googleButtonRef}
										className="flex justify-center"
									/>
									{!GOOGLE_CLIENT_ID && (
										<p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
											⚠️ Set{" "}
											<code className="font-mono">VITE_GOOGLE_CLIENT_ID</code>{" "}
											in your <code className="font-mono">.env</code> to enable
											Google Sign-In.
										</p>
									)}
								</motion.div>
							)}
						</AnimatePresence>

						<p className="text-xs text-slate-400 mt-8 text-center leading-relaxed max-w-65">
							By signing in, you agree to our Terms of Service. Your session is
							secured end-to-end.
						</p>
					</div>
				</div>

				<p className="text-center text-xs text-slate-400 mt-4 font-medium">
					KOSH Point of Sale · Cashier Edition
				</p>
			</motion.div>
		</div>
	);
};

export default LoginPage;
