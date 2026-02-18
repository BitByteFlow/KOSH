"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@kosh/ui/components/button";
import { Card} from "@kosh/ui/components/card";
import { Zap, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const GetStartedPage = () => {
	const [isLoading, setIsLoading] = useState(false);

	const handleGoogleSignIn = async () => {
		try {
			setIsLoading(true);
			await signIn("google", { callbackUrl: "/dashboard" });
		} catch (error) {
			console.error("Sign in error:", error);
			toast.error("Failed to sign in. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex bg-white font-sans text-gray-900 selection:bg-gray-900 selection:text-white">

			<div className="flex-1 flex flex-col p-6 md:p-12 lg:p-16">
				<nav>
					<Link href="/" className="flex items-center gap-2 group">
						<div className="h-8 w-8 bg-black text-white flex items-center justify-center rounded-lg group-hover:scale-95 transition-transform">
							<Zap size={18} className="fill-current" />
						</div>
						<span className="text-lg font-semibold tracking-tight">Kosh</span>
					</Link>
				</nav>

				<main className="flex-1 flex flex-col justify-center max-w-[340px] mx-auto w-full pb-20">
					<div className="mb-8">
						<h1 className="text-2xl font-bold tracking-tight mb-2 text-center">
							Welcome to Kosh
						</h1>
						<p className="text-gray-500 text-sm text-center">
							Get started to manage your workspace.
						</p>
					</div>

					<Button
						variant="outline"
						size="lg"
						className="hover:cursor-pointer w-full h-11 gap-3 text-sm font-medium rounded-lg border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] disabled:opacity-50"
						onClick={handleGoogleSignIn}
						disabled={isLoading}
					>
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<svg className="h-4 w-4" viewBox="0 0 24 24">
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.64l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
							</svg>
						)}
						{isLoading ? "Connecting..." : "Continue with Google"}
					</Button>

					<p className="mt-6 text-sm text-gray-400 text-center leading-relaxed">
						By clicking continue, you agree to our{" "}
						<Link href="#" className="text-gray-900 hover:underline">Terms of Service</Link> and{" "}
						<Link href="#" className="text-gray-900 hover:underline">Privacy Policy</Link>.
					</p>
				</main>

				<footer className="text-[11px] text-gray-400">
					© 2026 Kosh Inc.
				</footer>
			</div>

			<div className="hidden lg:flex flex-1 bg-gray-50 border-l border-gray-100 items-center justify-center p-12 overflow-hidden">
				<div className="w-full max-w-lg space-y-12">
					<div className="relative">
						<Card className="border-0 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] bg-white rounded-3xl overflow-hidden p-8 space-y-10 group cursor-default">
							<div className="flex justify-between items-start">
								<div className="space-y-1.5">
									<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Growth Velocity</p>
									<p className="text-4xl font-bold tracking-tight text-gray-900 group-hover:tracking-normal transition-all duration-700">+142.8%</p>
								</div>
								<div className="h-10 w-10 bg-black text-white flex items-center justify-center rounded-xl">
									<ArrowRight size={18} />
								</div>
							</div>

							<div className="h-32 flex items-end gap-2.5 px-1">
								{[30, 45, 40, 60, 85, 55, 95].map((h, i) => (
									<div
										key={i}
										className={`flex-1 rounded-lg transition-all duration-1000 ease-in-out ${i === 6
											? "bg-green-500"
											: "bg-gray-100"
											}`}
										style={{ height: `${h}%` }}
									/>
								))}
							</div>

							<div className="grid grid-cols-2 gap-8 pt-2">
								<div className="space-y-1">
									<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active nodes</p>
									<p className="text-xl font-bold">1,842</p>
								</div>
								<div className="space-y-1">
									<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Uptime</p>
									<p className="text-xl font-bold">99.9%</p>
								</div>
							</div>
						</Card>

						<div className="absolute -top-6 -right-6 h-12 w-12 bg-gray-200/50 rounded-full blur-2xl group-hover:bg-gray-300/60 transition-colors duration-1000" />
					</div>

					<div className="space-y-6 px-4">

						<blockquote className="space-y-4">
							<p className="text-2xl font-medium leading-snug tracking-tight text-gray-900">
								"Kosh isn't just a tool, it's the infrastructure that allows us to move at light speed."
							</p>
						</blockquote>
					</div>
				</div>
			</div>
		</div>
	);
}

export default GetStartedPage