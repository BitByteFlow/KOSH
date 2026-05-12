import Image from "next/image";
import { Card } from "@kosh/ui/components/card";
import { HeroHeader } from "@/components/Header";
import FooterSection from "@/components/Footer";

export default function AboutPage() {
	return (
		<section>
			<HeroHeader />
			<div className="relative overflow-hidden py-28">
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(50,65,255,0.12),transparent_60%)]" />

				<div className="mx-auto max-w-5xl px-6">
					<div className="max-w-3xl">
						<div className="bg-primary/10 text-primary inline-flex rounded-full px-3 py-1 text-sm font-medium">
							About KOSH
						</div>

						<h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight lg:text-6xl">
							Modern infrastructure for growing businesses.
						</h1>

						<p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
							KOSH is a modern inventory management and POS platform designed to
							simplify operations, improve visibility, and help businesses run
							faster with less complexity.
						</p>
					</div>

					<div className="mt-20 gap-4">
						<Card className="border-none relative overflow-hidden rounded-[2rem] border p-8 lg:col-span-2 lg:min-h-130">
							<div className="relative z-10">
								<div className="bg-primary/10 text-primary inline-flex rounded-full px-3 py-1 text-sm font-medium">
									Our Mission
								</div>
								<h2 className="mt-6 max-w-xl text-3xl font-semibold tracking-tight">
									Replace outdated business software with modern operational
									workflows.
								</h2>

								<p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
									Businesses still struggle with disconnected tools, manual
									inventory tracking, slow billing systems, and poor operational
									visibility.
								</p>

								<p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-8">
									KOSH brings inventory, POS billing, analytics, and financial
									tracking together into one clean, fast, and centralized
									platform.
								</p>
							</div>

							<div className="relative mt-14">
								<div className="relative overflow-hidden rounded-3xl bg-background/80 p-3 shadow-2xl shadow-primary/10 backdrop-blur">
									<Image
										src="/hero.png"
										alt="KOSH Dashboard"
										width={1400}
										height={900}
										className="rounded-2xl border"
									/>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</div>
			<FooterSection />
		</section>
	);
}
