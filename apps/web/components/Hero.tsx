import React from "react";
import { Button } from "@kosh/ui/components/button";
import { Sparkle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const HeroSection = () => (
	<main>
		<section className="relative overflow-hidden border-e-foreground before:absolute before:inset-1 before:h-[calc(100%-8rem)] before:rounded-2xl sm:before:inset-2 md:before:rounded-[2rem] lg:before:h-[calc(100%-14rem)]">
			{/* Background Gradient */}
			<div className="absolute inset-0 -z-10">
				<div className="absolute left-1/2 top-20 h-full w-125 -translate-x-1/2 rounded-full bg-[#3241ff]/20 blur-3xl" />

				<div className="absolute left-1/3 top-40 h-75 w-75 rounded-full bg-[#5561ff]/15 blur-3xl" />

				<div className="absolute bottom-0 right-1/4 h-62.5 w-62.5 rounded-full bg-[#2328b3]/10 blur-3xl" />
			</div>

			<div className="py-20 md:py-36">
				<div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
					<div>
						<Link
							href="#"
							className="hover:bg-foreground/5 mx-auto flex w-fit items-center justify-center gap-2 rounded-md py-0.5 pl-1 pr-3 transition-colors duration-150"
						>
							<div
								aria-hidden
								className="from-primary to-foreground relative flex size-5 items-center justify-center rounded border border-background bg-linear-to-b shadow-md shadow-black/20 ring-1 ring-black/10 dark:inset-shadow-2xs"
							>
								<div className="absolute inset-x-0 inset-y-1.5 border-y border-dotted border-white/25"></div>
								<div className="absolute inset-x-1.5 inset-y-0 border-x border-dotted border-white/25"></div>

								<Sparkle className="size-3 fill-white stroke-white drop-shadow" />
							</div>

							<span className="font-medium">Introducing KOSH</span>
						</Link>

						<h1 className="mx-auto mt-8 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
							Run Your Business Faster with KOSH
						</h1>

						<p className="text-muted-foreground mx-auto my-6 max-w-xl text-balance text-xl font-semibold">
							Manage sales, stock, and operations from one clean platform.
						</p>

						<div className="flex items-center justify-center gap-3">
							<Button
								asChild
								size="lg"
							>
								<Link href="/auth/get-started">
									<span className="text-nowrap">Start Free</span>
								</Link>
							</Button>

							<Button
								asChild
								size="lg"
								variant="outline"
							>
								<Link href="#link">
									<span className="text-nowrap">Watch Video</span>
								</Link>
							</Button>
						</div>
					</div>
				</div>

				<div className="relative">
					<div className="relative z-10 mx-auto max-w-5xl px-6">
						<div className="mt-12 md:mt-16">
							<div className="bg-background/80 rounded-lg relative mx-auto overflow-hidden border border-white/20 shadow-2xl shadow-[#3241ff]/10 ring-1 ring-black/5 backdrop-blur-sm">
								<Image
									src="/hero.png"
									alt="app screen"
									width="2880"
									height="1842"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>
);

export default HeroSection;
