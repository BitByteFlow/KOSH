import { Button } from "@kosh/ui/components/button";
import { Calendar, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
	return (
		<section className="relative py-20 w-full overflow-hidden bg-white">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#f5f3ff_0%,#ffffff_100%)]" />

			<div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center">
				<h2 className="text-slate-900 text-center text-balance text-4xl font-bold lg:text-6xl tracking-tight leading-[1.15]">
					Modern inventory and <br className="hidden md:block" />
					<span className="text-primary">POS infrastructure.</span>{" "}
					Built for growing businesses.
				</h2>

				<p className="text-slate-500 mt-6 text-center text-lg lg:text-xl max-w-2xl leading-relaxed">
					Manage billing, inventory, analytics, and business operations from one
					clean and fast platform.
				</p>

				<div className="mt-10 flex flex-wrap gap-4 items-center justify-center">
					<Button
						asChild
						size="lg"
						className="bg-primary hover:bg-primary/80 text-white px-7 h-12 rounded-xl text-base font-semibold shadow-lg shadow-purple-200 transition-transform active:scale-95"
					>
						<Link href="/auth/get-started" className="flex items-center gap-2">
							Start Free
							<ChevronRight strokeWidth={3} className="size-4 opacity-70" />
						</Link>
					</Button>

					<Button
						asChild
						variant="outline"
						size="lg"
						className="border-slate-200 bg-white/80 px-7 h-12 rounded-xl text-base font-semibold backdrop-blur-sm hover:bg-slate-50 transition-all"
					>
						<Link href="#" className="flex items-center gap-2">
							<Calendar className="size-4 opacity-70" strokeWidth={2.5} />
							Book a Demo
						</Link>
					</Button>
				</div>

				<div className="mt-10 flex items-center gap-2 text-slate-400 text-sm">
					<CheckCircle2 className="size-4" />
					<span className="tracking-wide uppercase text-[10px] font-bold">
						Trusted by 1000+ businesses
					</span>
				</div>
			</div>
		</section>
	);
}