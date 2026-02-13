import { Card } from "@kosh/ui/components/card";

export function MetricCardSkeleton() {
	return (
		<Card className="p-4 border border-border rounded-lg shadow-sm animate-pulse">
			<div className="flex items-start justify-between">
				<div className="space-y-3 w-full max-w-[70%]">
					<div className="h-4 w-24 bg-muted rounded-md" />

					<div className="h-8 w-32 bg-muted rounded-md" />

					<div className="h-3 w-40 bg-muted rounded-md" />
					<div className="flex items-center gap-2 mt-1">
						<div className="h-4 w-4 bg-muted rounded-full" />
						<div className="h-4 w-16 bg-muted rounded-md" />
						<div className="h-4 w-20 bg-muted rounded-md" />
					</div>
				</div>

				<div className="p-3 rounded-lg bg-muted/60">
					<div className="w-5 h-5 bg-muted-foreground/30 rounded-md" />
				</div>
			</div>
		</Card>
	);
}
