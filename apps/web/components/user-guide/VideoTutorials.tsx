import { Button } from "@kosh/ui/components/button";
import { PlayCircle, ArrowRight } from "lucide-react";

export function VideoTutorials() {
	return (
		<div className="rounded-lg border border-border p-6">
			<div className="flex items-center gap-2 mb-4">
				<PlayCircle className="h-6 w-6 text-primary" />
				<h3 className="font-semibold text-lg">Video Tutorials</h3>
			</div>
			<p className="text-sm text-muted-foreground mb-4">
				Watch step-by-step guides on our YouTube channel.
			</p>
			<Button
				variant="link"
				className="p-0 h-auto text-primary"
			>
				<span>Watch Videos</span>
				<ArrowRight className="h-4 w-4 ml-2" />
			</Button>
		</div>
	);
}
