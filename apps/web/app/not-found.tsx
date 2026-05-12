import Link from "next/link";
import { Button } from "@kosh/ui/components/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
	return (
		<section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
			<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(50,65,255,0.15),transparent_60%)]" />

			<div className="mx-auto max-w-2xl text-center">
				<div className="text-primary/20 mt-10 text-8xl font-bold tracking-tight sm:text-9xl">
					404
				</div>
				<h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
					Page not found
				</h1>
				<p className="text-muted-foreground mx-auto mt-6 max-w-lg text-lg leading-8">
					The page you are looking for doesn’t exist or may have been moved.
				</p>
				<div className="mt-10 flex flex-wrap items-center justify-center gap-3">
					<Button asChild>
						<Link href="/">
							<ArrowLeft className="mr-2 size-4" />
							Back to Home
						</Link>
					</Button>

					<Button
						asChild
						variant="outline"
					>
						<Link href="/auth/get-started">Get Started</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
