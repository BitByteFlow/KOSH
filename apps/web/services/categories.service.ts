import { gql } from "@apollo/client";
import { clientApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export const GET_CATEGORIES = gql`
  query GetCategories {
    getCategories {
      success
      message
      data {
        id
        name
      }
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(createCategoryInput: $input) {
      success
      message
      data {
        id
        name
      }
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, updateCategoryInput: $input) {
      success
      message
      data {
        id
        name
      }
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) {
      success
      message
    }
  }
`;

export interface Category {
	id: string;
	name: string;
}

export const categoriesService = {
	getCategories: async (
		token: string | undefined,
	): Promise<{ categories: Category[] }> => {
		const response = await clientApiClient.get<{ data: Category[] }>(
			API_ENDPOINTS.categories.list,
			token,
		);
		return { categories: response.data };
	},

	createCategory: async (
		name: string,
		token: string | undefined,
	): Promise<{ status: string; message: string }> => {
		return clientApiClient.post<{ status: string; message: string }>(
			API_ENDPOINTS.categories.create,
			token,
			{ name },
		);
	},
};
