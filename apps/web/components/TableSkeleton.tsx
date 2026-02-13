import { Card } from "@kosh/ui/components/card";
import { Skeleton } from "@kosh/ui/components/skeleton";

export function TransactionTableSkeleton() {
	return (
		<Card className="border border-border gap-2 p-6 overflow-hidden rounded-lg shadow-md">
			<div className="flex items-center justify-between py-2  border-border">
				<Skeleton className="h-7 w-44" />
				<Skeleton className="h-5 w-24" />
			</div>

			<div className="overflow-x-auto pt-4">
				<div className="flex items-center gap-4 pb-3 border-border">
					<Skeleton className="h-4 w-28" />
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-4 w-24 ml-auto" />
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-16 mx-auto" />
				</div>

				<div className="flex items-center gap-4 py-5 border-border last:border-b-0">
					<Skeleton className="h-5 w-36" />

					<Skeleton className="h-6 w-28 rounded-full" />

					<Skeleton className="h-5 w-28 ml-auto" />

					<Skeleton className="h-5 w-56 flex-1 max-w-xs" />

					<Skeleton className="h-8 w-8 rounded-md mx-auto shrink-0" />
				</div>

				<div className="flex items-center gap-4 py-5 border-border last:border-b-0">
					<Skeleton className="h-5 w-36" />

					<Skeleton className="h-6 w-28 rounded-full" />

					<Skeleton className="h-5 w-28 ml-auto" />

					<Skeleton className="h-5 w-56 flex-1 max-w-xs" />

					<Skeleton className="h-8 w-8 rounded-md mx-auto shrink-0" />
				</div>

				<div className="flex items-center justify-between pt-5 mt-2">
					<Skeleton className="h-5 w-36" />
					<div className="flex gap-2">
						<Skeleton className="h-9 w-24 rounded-md" />
						<Skeleton className="h-9 w-24 rounded-md" />
					</div>
				</div>
			</div>
		</Card>
	);
}
