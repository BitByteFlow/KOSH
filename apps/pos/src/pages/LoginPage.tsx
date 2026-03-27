import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

const LoginPage: React.FC = () => {
	const { loginWithGoogle, isAuthenticated, needsOnboarding } = useAuth();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const handleGoogleResponse = useCallback(
		async (response: CredentialResponse) => {
			if (!response.credential) {
				toast.error("Sign in failed. Please try again.");
				return;
			}

			setIsLoading(true);
			try {
				const payload = JSON.parse(atob(response.credential.split(".")[1]));
				await loginWithGoogle({
					googleId: payload.sub,
					email: payload.email,
					username: payload.name,
					image: payload.picture,
				});
			} catch {
				toast.error("Sign in failed. Please try again.");
			} finally {
				setIsLoading(false);
			}
		},
		[loginWithGoogle],
	);

	const handleError = useCallback(() => {
		toast.error("Google Sign-In failed. Please try again.");
	}, []);

	useEffect(() => {
		if (isAuthenticated && !needsOnboarding) {
			navigate("/", { replace: true });
		} else if (isAuthenticated && needsOnboarding) {
			navigate("/get-started", { replace: true });
		}
	}, [isAuthenticated, needsOnboarding, navigate]);

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
				<div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
					<div className="h-2 bg-linear-to-r from-primary via-blue-500 to-violet-500" />

					<div className="p-10 flex flex-col items-center">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{
								delay: 0.1,
								type: "spring",
								stiffness: 300,
								damping: 20,
							}}
							className="w-16 h-16 rounded-2xl shadow-lg shadow-primary/25 mb-6"
						>
							<img
								src="/logo.svg"
								alt="KOSH's logo"
							/>
						</motion.div>

						<h1 className="text-2xl font-black text-slate-900 tracking-tight">
							KOSH POS
						</h1>
						<p className="text-slate-500 text-normal font-medium mt-1 text-center leading-relaxed">
							Sign in to access your cashier dashboard
						</p>

						<div className="my-8 w-full border-t border-slate-100" />

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
									{GOOGLE_CLIENT_ID ? (
										<GoogleLogin
											onSuccess={handleGoogleResponse}
											onError={handleError}
											useOneTap
											theme="filled_blue"
											size="large"
											text="signin_with"
											shape="pill"
											width={300}
										/>
									) : (
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

						<p className="text-sm text-slate-400 mt-8 text-center leading-relaxed max-w-65">
							By signing in, you agree to our Terms of Service. Your session is
							secured end-to-end.
						</p>
					</div>
				</div>

				<p className="text-center text-sm text-slate-500 mt-4 font-medium">
					KOSH Point of Sale · Cashier Edition
				</p>
			</motion.div>
		</div>
	);
};

export default LoginPage;
