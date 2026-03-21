"use client";

import { useQuery as useApolloQuery, useMutation as useApolloMutation } from "@apollo/client/react";
import { useQueryClient } from "@tanstack/react-query";
import {
	LIST_PRODUCTS_WITH_FILTER,
	CREATE_PRODUCT,
	UPDATE_PRODUCT,
	DELETE_PRODUCT,
	ADD_VARIANT,
	UPDATE_PRODUCT_VARIANT,
	DELETE_PRODUCT_VARIANT
} from "@/services/products.service";
import {
	GET_CATEGORIES,
	CREATE_CATEGORY,
	UPDATE_CATEGORY,
	DELETE_CATEGORY
} from "@/services/categories.service";
import { toast } from "sonner";
import {
	ProductResponse,
	ProductFilterInput,
	CreateProductInput,
	UpdateProductInput,
	VariantInput,
	UpdateProductVariantInput,
	CategoryResponse,
	CreateCategoryInput,
	UpdateCategoryInput
} from "@/gql/graphql";

export const productKeys = {
	all: ["products"] as const,
	list: (params: any) => [...productKeys.all, "list", params] as const,
};

export const categoryKeys = {
	all: ["categories"] as const,
};

export const useProductList = (params: ProductFilterInput = { page: 1, limit: 10 }) => {
	return useApolloQuery<{ listProductsWithFilter: ProductResponse }>(LIST_PRODUCTS_WITH_FILTER, {
		variables: { filterInput: params },
		fetchPolicy: "cache-and-network",
	});
};

export const useCreateProduct = () => {
	const queryClient = useQueryClient();

	return useApolloMutation<{ createProduct: ProductResponse }, { input: CreateProductInput }>(
		CREATE_PRODUCT,
		{
			refetchQueries: ["ListProductsWithFilter"],
			onCompleted: (data) => {
				if (data.createProduct.success) {
					toast.success(data.createProduct.message || "Product created successfully");
					queryClient.invalidateQueries({ queryKey: productKeys.all });
				} else {
					toast.error(data.createProduct.message || "Failed to create product");
				}
			},
			onError: (error) => {
				toast.error(error.message || "Error creating product");
			},
		}
	);
};

export const useUpdateProduct = () => {
	const queryClient = useQueryClient();

	return useApolloMutation<{ updateProduct: ProductResponse }, { productId: string; input: UpdateProductInput }>(
		UPDATE_PRODUCT,
		{
			refetchQueries: ["ListProductsWithFilter"],
			onCompleted: (data) => {
				if (data.updateProduct.success) {
					toast.success(data.updateProduct.message || "Product updated successfully");
					queryClient.invalidateQueries({ queryKey: productKeys.all });
				} else {
					toast.error(data.updateProduct.message || "Failed to update product");
				}
			},
			onError: (error) => {
				toast.error(error.message || "Error updating product");
			},
		}
	);
};

export const useDeleteProduct = () => {
	const queryClient = useQueryClient();

	return useApolloMutation<{ deleteProduct: ProductResponse }, { productId: string }>(
		DELETE_PRODUCT,
		{
			refetchQueries: ["ListProductsWithFilter"],
			onCompleted: (data) => {
				if (data.deleteProduct.success) {
					toast.success(data.deleteProduct.message || "Product deleted successfully");
					queryClient.invalidateQueries({ queryKey: productKeys.all });
				} else {
					toast.error(data.deleteProduct.message || "Failed to delete product");
				}
			},
			onError: (error) => {
				toast.error(error.message || "Error deleting product");
			},
		}
	);
};

export const useAddVariant = () => {
	const queryClient = useQueryClient();

	return useApolloMutation<{ addVariant: ProductResponse }, { productId: string; input: VariantInput }>(
		ADD_VARIANT,
		{
			refetchQueries: ["ListProductsWithFilter"],
			onCompleted: (data) => {
				if (data.addVariant.success) {
					toast.success(data.addVariant.message || "Variant added successfully");
					queryClient.invalidateQueries({ queryKey: productKeys.all });
				} else {
					toast.error(data.addVariant.message || "Failed to add variant");
				}
			},
			onError: (error) => {
				toast.error(error.message || "Error adding variant");
			},
		}
	);
};

export const useUpdateVariant = () => {
	const queryClient = useQueryClient();

	return useApolloMutation<{ updateProductVariant: ProductResponse }, { variantId: string; input: UpdateProductVariantInput }>(
		UPDATE_PRODUCT_VARIANT,
		{
			refetchQueries: ["ListProductsWithFilter"],
			onCompleted: (data) => {
				if (data.updateProductVariant.success) {
					toast.success(data.updateProductVariant.message || "Variant updated successfully");
					queryClient.invalidateQueries({ queryKey: productKeys.all });
				} else {
					toast.error(data.updateProductVariant.message || "Failed to update variant");
				}
			},
			onError: (error) => {
				toast.error(error.message || "Error updating variant");
			},
		}
	);
};

export const useDeleteVariant = () => {
	const queryClient = useQueryClient();

	return useApolloMutation<{ deleteProductVariant: ProductResponse }, { productId: string; variantId: string }>(
		DELETE_PRODUCT_VARIANT,
		{
			refetchQueries: ["ListProductsWithFilter"],
			onCompleted: (data) => {
				if (data.deleteProductVariant.success) {
					toast.success(data.deleteProductVariant.message || "Variant deleted successfully");
					queryClient.invalidateQueries({ queryKey: productKeys.all });
				} else {
					toast.error(data.deleteProductVariant.message || "Failed to delete variant");
				}
			},
			onError: (error) => {
				toast.error(error.message || "Error deleting variant");
			},
		}
	);
};

export const useCategoryList = () => {
	return useApolloQuery<{ getCategories: CategoryResponse }>(GET_CATEGORIES, {
		fetchPolicy: "cache-and-network",
	});
};

export const useCreateCategory = () => {
	const queryClient = useQueryClient();

	return useApolloMutation<{ createCategory: CategoryResponse }, { input: CreateCategoryInput }>(
		CREATE_CATEGORY,
		{
			refetchQueries: ["GetCategories"],
			onCompleted: (data) => {
				if (data.createCategory.success) {
					toast.success(data.createCategory.message || "Category created successfully");
					queryClient.invalidateQueries({ queryKey: categoryKeys.all });
				} else {
					toast.error(data.createCategory.message || "Failed to create category");
				}
			},
			onError: (error) => {
				toast.error(error.message || "Error creating category");
			},
		}
	);
};

export const useUpdateCategory = () => {
	const queryClient = useQueryClient();

	return useApolloMutation<{ updateCategory: CategoryResponse }, { id: string; input: UpdateCategoryInput }>(
		UPDATE_CATEGORY,
		{
			refetchQueries: ["GetCategories"],
			onCompleted: (data) => {
				if (data.updateCategory.success) {
					toast.success(data.updateCategory.message || "Category updated successfully");
					queryClient.invalidateQueries({ queryKey: categoryKeys.all });
				} else {
					toast.error(data.updateCategory.message || "Failed to update category");
				}
			},
			onError: (error) => {
				toast.error(error.message || "Error updating category");
			},
		}
	);
};

export const useDeleteCategory = () => {
	const queryClient = useQueryClient();

	return useApolloMutation<{ deleteCategory: CategoryResponse }, { id: string }>(
		DELETE_CATEGORY,
		{
			refetchQueries: ["GetCategories"],
			onCompleted: (data) => {
				if (data.deleteCategory.success) {
					toast.success(data.deleteCategory.message || "Category deleted successfully");
					queryClient.invalidateQueries({ queryKey: categoryKeys.all });
				} else {
					toast.error(data.deleteCategory.message || "Failed to delete category");
				}
			},
			onError: (error) => {
				toast.error(error.message || "Error deleting category");
			},
		}
	);
};
