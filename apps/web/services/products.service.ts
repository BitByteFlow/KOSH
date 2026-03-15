import { gql } from "@apollo/client";
import { Status } from "@/gql/graphql";
import { clientApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export const LIST_PRODUCTS_WITH_FILTER = gql`
	query ListProductsWithFilter($filterInput: ProductFilterInput!) {
		listProductsWithFilter(filterInput: $filterInput) {
			success
			message
			data {
				id
				productName
				category {
					id
					name
				}
				totalStock
				variantCount
				status
				variants {
					id
					sku
					barcode
					attributes {
						name
						value
					}
					price
					stock
					lowStock
					status
					sellingPrice
					costPrice
				}
			}
			meta {
				page
				limit
				total
				totalPages
				hasNext
				hasPrev
			}
		}
	}
`; export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(createProductInput: $input) {
      success
      message
      data {
        id
        productName
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($productId: ID!, $input: UpdateProductInput!) {
    updateProduct(productId: $productId, updateProductInput: $input) {
      success
      message
      data {
        id
        productName
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($productId: ID!) {
    deleteProduct(productId: $productId) {
      success
      message
    }
  }
`;

export const ADD_VARIANT = gql`
  mutation AddVariant($productId: ID!, $input: VariantInput!) {
    addVariant(productId: $productId, variantInput: $input) {
      success
      message
      data {
        id
        productName
      }
    }
  }
`;

export const UPDATE_PRODUCT_VARIANT = gql`
  mutation UpdateProductVariant($variantId: ID!, $input: UpdateProductVariantInput!) {
    updateProductVariant(productVariantId: $variantId, updateProductVariantInput: $input) {
      success
      message
    }
  }
`;

export const DELETE_PRODUCT_VARIANT = gql`
  mutation DeleteProductVariant($productId: ID!, $variantId: ID!) {
    deleteProductVariant(productId: $productId, productVariantId: $variantId) {
      success
      message
    }
  }
`;

export interface ProductVariant {
	id: string;
	sku: string;
	barcode: string;
	attributes: { name: string; value: string }[];
	price: number;
	stock: number;
	lowStock: boolean;
	status: string;
	sellPrice: number;
	costPrice: number;
}

export interface Product {
	id: string;
	productName: string;
	category: string;
	totalStock: number;
	variantCount: number;
	status: Status
	variants: ProductVariant[];
}

export interface PaginatedProducts {
	data: Product[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export const productsService = {
	getProducts: async (
		token: string | undefined,
		params?: {
			search?: string;
			limit?: number;
			page?: number;
			categoryId?: string;
			status?: string
		}
	): Promise<PaginatedProducts> => {
		const cleanParams = Object.fromEntries(
			Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null && v !== "undefined")
		);

		return clientApiClient.get<PaginatedProducts>(API_ENDPOINTS.products.list, token, {
			params: cleanParams as any,
		});
	},

	createProduct: async (
		data: any,
		token: string | undefined
	): Promise<{ status: string; message: string }> => {
		return clientApiClient.post<{ status: string; message: string }>(
			API_ENDPOINTS.products.create,
			token,
			data
		);
	},

	updateProduct: async (
		id: string,
		data: any,
		token: string | undefined
	): Promise<{ status: string; message: string }> => {
		return clientApiClient.patch<{ status: string; message: string }>(
			API_ENDPOINTS.products.update(id),
			token,
			data
		);
	},

	deleteProduct: async (
		id: string,
		token: string | undefined
	): Promise<{ status: string; message: string }> => {
		return clientApiClient.delete<{ status: string; message: string }>(
			API_ENDPOINTS.products.delete(id),
			token
		);
	},

	updateVariant: async (
		productId: string,
		variantId: string,
		data: any,
		token: string | undefined
	): Promise<{ status: string; message: string }> => {
		return clientApiClient.put<{ status: string; message: string }>(
			API_ENDPOINTS.products.updateVariant(variantId),
			token,
			{ ...data, productId, variantId }
		);
	},
};
