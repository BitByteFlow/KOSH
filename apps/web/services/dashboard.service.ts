import { auth } from "@/app/api/auth/[...nextauth]/auth";

export interface DashboardMetrics {
	openingCash: string;
	closingCash: string;
	totalSales: string;
	totalExpense: string;
	totalCashIn: string;
	totalCashOut: string;
}

export const getDashboardMetrics = async (): Promise<DashboardMetrics | null> => {
	const session = await auth();
	
	if (!session?.user?.token) {
		return null;
	}

	const apiUrl = process.env.NEXT_PUBLIC_API_V1_ROOT_URL || "http://localhost:3001/api/v1";
	
	try {
		const res = await fetch(`${apiUrl}/accounts/balance`, {
			headers: {
				Authorization: `Bearer ${session.user.token}`,
				"Content-Type": "application/json",
			},
			cache: "no-store",
		});

		if (!res.ok) {
			console.error("Failed to fetch dashboard metrics:", await res.text());
			return null;
		}

		return await res.json();
	} catch (error) {
		console.error("Error fetching dashboard metrics:", error);
		return null;
	}
};
