import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { productsService } from "../../../services/products.service";
import { categoriesService } from "../../../services/categories.service";

export const useProductList = (params?: { 
	search?: string; 
	limit?: number; 
	page?: number; 
	categoryId?: string;
	status?: string;
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

export const useUpdateProduct = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: any }) =>
			productsService.updateProduct(id, data, token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			queryClient.invalidateQueries({ queryKey: ["daily-balance"] });
			queryClient.invalidateQueries({ queryKey: ["account-transactions"] });
		},
	});
};

export const useDeleteProduct = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useMutation({
		mutationFn: (id: string) => productsService.deleteProduct(id, token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			queryClient.invalidateQueries({ queryKey: ["daily-balance"] });
			queryClient.invalidateQueries({ queryKey: ["account-transactions"] });
		},
	});
};

export const useUpdateVariant = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useMutation({
		mutationFn: ({ productId, variantId, data }: { productId: string; variantId: string; data: any }) =>
			productsService.updateVariant(productId, variantId, data, token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
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

export const useCreateCategory = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useMutation({
		mutationFn: (name: string) => categoriesService.createCategory(name, token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
	});
};
