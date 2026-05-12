import { Card } from "@kosh/ui/components/card";
import {
	ArrowRight,
	BarChart3,
	ReceiptText,
	ShieldCheck,
	Store,
} from "lucide-react";

export default function SolutionSection() {
	return (
		<section className="py-24" id="solution">
			<div className="mx-auto max-w-6xl px-6">
				<div className="grid gap-16 lg:grid-cols-2 lg:items-center">
					<div>
						<div className="bg-primary/10 text-primary inline-flex rounded-full px-3 py-1 text-sm font-medium">
							Solution
						</div>

						<h2 className="mt-6 max-w-xl text-balance text-4xl font-semibold tracking-tight text-foreground">
							Everything your business needs to operate efficiently.
						</h2>

						<p className="text-muted-foreground mt-6 max-w-xl text-lg leading-8">
							KOSH combines inventory management, billing, analytics, and
							operational tracking into one modern platform built for growing
							businesses.
						</p>

						<div className="mt-8 space-y-4">
							<SolutionItem text="Real-time inventory tracking" />
							<SolutionItem text="Fast and modern POS billing" />
							<SolutionItem text="Revenue and sales analytics" />
							<SolutionItem text="Centralized business management" />
							<SolutionItem text="Role-based team access" />
						</div>
					</div>

					<Card className="border-none relative overflow-hidden rounded-3xl border p-6 shadow-xl shadow-primary/5">
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<MiniCard
									icon={<ReceiptText className="size-4" />}
									title="Daily Sales"
									value="$12,420"
								/>

								<MiniCard
									icon={<BarChart3 className="size-4" />}
									title="Revenue"
									value="+18.4%"
								/>
							</div>

							<div className="rounded-2xl bg-muted/50 p-5">
								<div className="flex items-center justify-between">
									<div>
										<div className="text-sm font-medium">Sales Overview</div>

										<div className="mt-1 text-2xl font-semibold">$48,240</div>
									</div>

									<div className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium">
										+12%
									</div>
								</div>

								<div className="mt-6 flex h-28 items-end gap-2">
									{[40, 75, 55, 90, 60, 110, 85].map((height) => (
										<div
											key={height}
											style={{ height }}
											className="bg-primary/80 w-full rounded-md"
										/>
									))}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<FeaturePreview
									icon={<Store className="size-4" />}
									title="Store Management"
								/>

								<FeaturePreview
									icon={<ShieldCheck className="size-4" />}
									title="Secure Access"
								/>
							</div>
						</div>

						<div className="bg-primary/10 absolute inset-x-0 top-0 h-32 blur-3xl" />
					</Card>
				</div>
			</div>
		</section>
	);
}

function SolutionItem({ text }: { text: string }) {
	return (
		<div className="flex items-center gap-3">
			<div className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-full">
				<ArrowRight className="size-3.5" />
			</div>

			<span className="text-muted-foreground">{text}</span>
		</div>
	);
}

function MiniCard({
	icon,
	title,
	value,
}: {
	icon: React.ReactNode;
	title: string;
	value: string;
}) {
	return (
		<div className="rounded-2xl bg-muted/50 p-4">
			<div className="text-primary">{icon}</div>

			<div className="mt-4 text-sm text-muted-foreground">{title}</div>

			<div className="mt-1 text-xl font-semibold">{value}</div>
		</div>
	);
}

function FeaturePreview({
	icon,
	title,
}: {
	icon: React.ReactNode;
	title: string;
}) {
	return (
		<div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
			<div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl">
				{icon}
			</div>

			<div className="text-sm font-medium">{title}</div>
		</div>
	);
}
