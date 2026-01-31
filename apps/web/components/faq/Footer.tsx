import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FAQFooter() {
	return (
		<div className="mt-16 pt-12 border-t border-border text-center">
			<p className="text-muted-foreground mb-3">Still have questions?</p>
			<Link
				href="/contact-support"
				className="inline-flex items-center text-primary hover:underline font-medium"
			>
				Chat with our support team
				<ArrowRight className="ml-2 h-4 w-4" />
			</Link>
		</div>
	);
}
