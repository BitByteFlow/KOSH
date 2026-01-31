import { useState } from "react";
import { Calendar } from "lucide-react";

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
		<div className="flex items-center gap-3">
			{ranges.map((range) => (
				<button
					key={range}
					onClick={() => handleRangeClick(range)}
					className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
						activeRange === range
							? "bg-primary text-primary-foreground"
							: "text-foreground hover:bg-muted"
					}`}
				>
					{range === "Custom Range" ? (
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							{range}
						</div>
					) : (
						range
					)}
				</button>
			))}
		</div>
	);
}
