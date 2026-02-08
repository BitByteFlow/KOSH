"use server";

import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { revalidatePath } from "next/cache";

export async function addOpeningCash(data: { amount: number; note: string; type: string }) {
	const session = await auth();

	if (!session?.user?.token) {
		return { success: false, message: "Unauthorized" };
	}

	const apiUrl = process.env.NEXT_PUBLIC_API_V1_ROOT_URL || "http://localhost:3001/api/v1";

	try {
		const response = await fetch(`${apiUrl}/accounts/transactions`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${session.user.token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				type: data.type,
				amount: data.amount,
				note: data.note,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			return {
				success: false,
				message: errorData.message || "Failed to add opening cash",
			};
		}

		revalidatePath("/dashboard");
		return { success: true, message: "Opening cash added successfully" };
	} catch (error) {
		console.error("Error adding opening cash:", error);
		return { success: false, message: "Internal server error" };
	}
}

export async function addWithdrawCash(data: { amount: number; note: string; type: string }) {
	const session = await auth();

	if (!session?.user?.token) {
		return { success: false, message: "Unauthorized" };
	}

	const apiUrl = process.env.NEXT_PUBLIC_API_V1_ROOT_URL || "http://localhost:3001/api/v1";

	try {
		const response = await fetch(`${apiUrl}/accounts/transactions`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${session.user.token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				type: data.type,
				amount: data.amount,
				note: data.note,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			return {
				success: false,
				message: errorData.message || "Failed to process transaction",
			};
		}

		revalidatePath("/dashboard");
		return { success: true, message: "Transaction recorded successfully" };
	} catch (error) {
		console.error("Error processing transaction:", error);
		return { success: false, message: "Internal server error" };
	}
}
