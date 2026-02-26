import { gql } from "@apollo/client";
import { clientApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export const GET_SETTINGS = gql`
  query GetSettings {
    settings {
      success
      message
      data {
        id
        userId
        lowStockThreshold
        autoArchive
        emailReports
        pushNotifications
      }
    }
  }
`;

export const UPDATE_SETTINGS = gql`
  mutation UpdateSettings($input: UpdateSettingsInput!) {
    updateSettings(input: $input) {
      success
      message
      data {
        id
        userId
        lowStockThreshold
        autoArchive
        emailReports
        pushNotifications
      }
    }
  }
`;

export interface Settings {
	id: string;
	userId: string;
	lowStockThreshold: number;
	autoArchive: boolean;
	emailReports: boolean;
	pushNotifications: boolean;
}

export interface SettingsResponse {
	success: boolean;
	message: string;
	data?: Settings;
}

export interface UpdateSettingsInput {
	lowStockThreshold?: number;
	autoArchive?: boolean;
	emailReports?: boolean;
	pushNotifications?: boolean;
}

export const settingsService = {
	getSettings: async (token: string | undefined): Promise<SettingsResponse> => {
		const response = await clientApiClient.post<{ data: { settings: SettingsResponse } }>(
			API_ENDPOINTS.graphql,
			token,
			{
				query: GET_SETTINGS.loc?.source.body,
			},
		);
		return response.data.settings;
	},

	updateSettings: async (
		input: UpdateSettingsInput,
		token: string | undefined,
	): Promise<SettingsResponse> => {
		const response = await clientApiClient.post<{ data: { updateSettings: SettingsResponse } }>(
			API_ENDPOINTS.graphql,
			token,
			{
				query: UPDATE_SETTINGS.loc?.source.body,
				variables: { input },
			},
		);
		return response.data.updateSettings;
	},
};
