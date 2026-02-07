import { Button } from "@kosh/ui/components/button";
import { HeadphonesIcon } from "lucide-react";

export function SupportCard() {
	return (
		<div className="bg-foreground text-background rounded-lg p-6 flex flex-col gap-4">
			<div className="flex items-center gap-2">
				<HeadphonesIcon className="h-6 w-6" />
				<h3 className="font-semibold text-lg">Contact Support</h3>
			</div>
			<p className="text-sm opacity-90">
				Can't find what you're looking for? Our team is available 24/7.
			</p>
			<Button className="w-full bg-background text-foreground hover:bg-background/90">
				Open Ticket
			</Button>
		</div>
	);
}
