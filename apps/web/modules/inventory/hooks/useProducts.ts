import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { productsService } from "../../../services/products.service";
import { categoriesService } from "../../../services/categories.service";

export const useProductList = (params?: { 
	search?: string; 
	limit?: number; 
	page?: number; 
	categoryId?: string;
	lowStock?: number;
}) => {
	const { data: session } = useSession();
	const token = session?.user?.token;
	return useQuery({
		queryKey: ["products", params],
		queryFn: () => productsService.getProducts(token, params),
		enabled: !!token,
	});
};

export const useCreateProduct = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useMutation({
		mutationFn: (data: any) => productsService.createProduct(data, token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			queryClient.invalidateQueries({ queryKey: ["daily-balance"] });
			queryClient.invalidateQueries({ queryKey: ["account-transactions"] });
		},
	});
};

export const useCategoryList = () => {
	const { data: session } = useSession();
	const token = session?.user?.token;
	return useQuery({
		queryKey: ["categories"],
		queryFn: () => categoriesService.getCategories(token),
		enabled: !!token,
	});
};
