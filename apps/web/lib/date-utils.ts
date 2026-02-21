export const getDateRange = (range: string) => {
	const now = new Date();
	const end = new Date();
	let start = new Date();

	if (range.startsWith("Custom:")) {
		const parts = range.split(":");
		const dates = parts[1]?.split(",");
		if (dates && dates.length === 2) {
			const [startStr, endStr] = dates;
			return {
				startDate: startStr ? new Date(startStr).toISOString() : start.toISOString(),
				endDate: endStr ? new Date(endStr).toISOString() : end.toISOString(),
			};
		}
	}

	switch (range) {
		case "This Week":
			const day = now.getDay();
			const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
			start = new Date(now.setDate(diff));
			start.setHours(0, 0, 0, 0);
			break;
		case "This Month":
			start = new Date(now.getFullYear(), now.getMonth(), 1);
			start.setHours(0, 0, 0, 0);
			break;
		case "This Year":
			start = new Date(now.getFullYear(), 0, 1);
			start.setHours(0, 0, 0, 0);
			break;
		case "Today":
			start.setHours(0, 0, 0, 0);
			break;
		default:
			// Default to This Month if unknown
			start = new Date(now.getFullYear(), now.getMonth(), 1);
			start.setHours(0, 0, 0, 0);
	}

	return {
		startDate: start.toISOString(),
		endDate: end.toISOString(),
	};
};
