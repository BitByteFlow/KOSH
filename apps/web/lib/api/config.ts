export const API_CONFIG = {
	baseURL: process.env.NEXT_PUBLIC_API_V1_ROOT_URL || "http://localhost:5000/api/v1/",
	
	timeout: 30000,
	
	retry: {
		attempts: 3,
		delay: 1000, 
		backoff: 2, 
	},
	
	cache: {
		staleTime: 5 * 60 * 1000,
		cacheTime: 10 * 60 * 1000, 
	},
} as const;

export const API_ENDPOINTS = {
	account: {
		balance: "accounts/balance",
		transactions: "accounts/transactions",
	},
	
	auth: {
		login: "auth/login",
		register: "auth/register",
		logout: "auth/logout",
	},
	
	products: {
		list: "products",
		detail: (id: string) => `products/${id}`,
		create: "products",
		update: (id: string) => `products/${id}`,
		delete: (id: string) => `products/${id}`,
		updateVariant: (id: string) => `products/variants/${id}`,
	},
	
	sales: {
		list: "sales",
		detail: (id: string) => `sales/${id}`,
		create: "sales",
		metrics: "sales/todays-metrices",
	},
	
	categories: {
		list: "categories",
		detail: (id: string) => `categories/${id}`,
		create: "categories",
	},
	
	purchases: {
		list: "purchases",
		detail: (id: string) => `purchases/${id}`,
		create: "purchases",
	},
	
	reports: {
		sales: "reports/sales",
		inventory: "reports/inventory",
		analytics: "reports/analytics/metrics",
	},
	
	users: {
		profile: "users/profile",
		update: "users/profile",
	},
} as const;
