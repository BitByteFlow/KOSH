import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { API_CONFIG } from "./api/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalizeWords(str: string): string {
  if (!str) return "";
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatCurrency(amount: string | number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "NPR",
		currencyDisplay: "narrowSymbol",
	}).format(Number(amount));
}


export function buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
	const url = new URL(endpoint, API_CONFIG.baseURL);

	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			url.searchParams.append(key, String(value));
		});
	}

	return url.toString();
}