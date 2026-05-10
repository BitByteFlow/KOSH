import { Button } from "@kosh/ui/components/button";
import { Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
	return (
		<section>
			<div className="bg-muted py-20">
				<div className="mx-auto max-w-5xl px-6">
					<h2 className="text-foreground max-w-2xl text-balance text-3xl font-semibold lg:text-4xl">
						<span className="text-primary">
							Modern inventory and POS infrastructure.
						</span>{" "}
						Built for growing businesses.
					</h2>

					<p className="text-muted-foreground mt-4 max-w-xl text-lg">
						Manage billing, inventory, analytics, and business operations from
						one clean and fast platform.
					</p>

					<div className="mt-8 flex flex-wrap gap-3">
						<Button
							asChild
							className="pr-2"
						>
							<Link href="/auth/get-started">
								Start Free
								<ChevronRight
									strokeWidth={2.5}
									className="size-3.5! opacity-50"
								/>
							</Link>
						</Button>

						<Button
							asChild
							variant="outline"
							className="pl-2.5 border-none"
						>
							<Link href="#">
								<Calendar
									className="size-3.5! opacity-50"
									strokeWidth={2.5}
								/>
								Book a Demo
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
