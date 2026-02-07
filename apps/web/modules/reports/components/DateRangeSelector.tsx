import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@kosh/ui/components/button";

interface DateRangeSelectorProps {
	onRangeChange: (range: string) => void;
}

export function DateRangeSelector({ onRangeChange }: DateRangeSelectorProps) {
	const [activeRange, setActiveRange] = useState("This Month");
	const ranges = ["This Week", "This Month", "This Year", "Custom Range"];

	const handleRangeClick = (range: string) => {
		setActiveRange(range);
		onRangeChange(range);
	};

	return (
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
	);
}
