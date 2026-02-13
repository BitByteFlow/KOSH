export const getDateRange = (range: string) => {
	const now = new Date();
	const end = new Date();
	let start = new Date();

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
