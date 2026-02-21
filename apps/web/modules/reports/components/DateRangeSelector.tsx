import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@kosh/ui/components/dialog";
import { Label } from "@kosh/ui/components/label";

interface DateRangeSelectorProps {
	onRangeChange: (range: string) => void;
}

export function DateRangeSelector({ onRangeChange }: DateRangeSelectorProps) {
	const [activeRange, setActiveRange] = useState("This Month");
	const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
	const [customDates, setCustomDates] = useState({
		start: new Date().toISOString().split('T')[0],
		end: new Date().toISOString().split('T')[0],
	});

	const ranges = ["This Week", "This Month", "This Year", "Custom Range"];

	const handleRangeClick = (range: string) => {
		if (range === "Custom Range") {
			setIsCustomDialogOpen(true);
		} else {
			setActiveRange(range);
			onRangeChange(range);
		}
	};

	const handleApplyCustomRange = () => {
		setActiveRange("Custom Range");
		onRangeChange(`Custom:${customDates.start},${customDates.end}`);
		setIsCustomDialogOpen(false);
	};

	return (
		<div className="flex items-center gap-4">
			<div className="flex items-center rounded-lg border border-border bg-card p-1">
				{ranges.map((range) => (
					<Button
						key={range}
						onClick={() => handleRangeClick(range)}
						variant={activeRange === range ? "secondary" : "ghost"}
						className="h-8 px-3 text-sm"
					>
						{range === "Custom Range" && <Calendar className="mr-2 h-4 w-4" />}
						{range}
					</Button>
				))}
			</div>

			<Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Select Custom Range</DialogTitle>
						<DialogDescription>
							Choose the start and end dates for your report.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="startDate">Start Date</Label>
								<input
									id="startDate"
									type="date"
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									value={customDates.start}
									onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="endDate">End Date</Label>
								<input
									id="endDate"
									type="date"
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									value={customDates.end}
									onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsCustomDialogOpen(false)}>Cancel</Button>
						<Button onClick={handleApplyCustomRange}>Set Range</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
