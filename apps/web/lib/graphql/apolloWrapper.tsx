"use client"

import type { DocumentNode } from "graphql"
import { ApolloNextAppProvider, ApolloClient, InMemoryCache } from "@apollo/client-integration-nextjs"
import { HttpLink, split, from, CombinedGraphQLErrors } from "@apollo/client"
import { ErrorLink } from "@apollo/client/link/error"
import { getMainDefinition } from "@apollo/client/utilities"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { createClient, Client as WsClient } from "graphql-ws"
import { useSession } from "next-auth/react"

let wsClientRef: WsClient | null = null

// Custom link to filter specific subscription errors
const notificationErrorFilter = new ErrorLink(({ error }) => {
	// ErrorLink cannot suppress errors in Apollo Client v4
	// The errorPolicy: "ignore" setting in defaultOptions handles suppression
	// This link is kept for potential future customization
	if (CombinedGraphQLErrors.is(error)) {
		const hasAuthError = error.errors.some(
			(err: { message?: string }) => err.message?.includes("Please login") || err.message?.includes("Unauthorized"),
		)
		if (hasAuthError) {
			// Errors will be handled by errorPolicy setting
			return
		}
	}
})

const mergeField = (_existing: unknown, incoming: unknown) => incoming

const makeClient = (accessToken?: string, storeId?: string) => {
	const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5000/graphql"
	const wsUrl = graphqlUrl.replace(/^http/, "ws")

	const httpLink = new HttpLink({
		uri: graphqlUrl,
		headers: {
			Authorization: accessToken ? `Bearer ${accessToken}` : "",
			"x-store-id": storeId || "",
		},
	})

	if (wsClientRef && !accessToken) {
		wsClientRef.dispose()
		wsClientRef = null
	}

	const wsLink =
		typeof window !== "undefined" && accessToken
			? new GraphQLWsLink(
					createClient({
						url: wsUrl,
						connectionParams: {
							Authorization: `Bearer ${accessToken}`,
							"x-store-id": storeId || "",
						},
						retryAttempts: 0,
						shouldRetry: () => false,
						on: {
							error: () => {
								// Silently handle WebSocket errors
							},
							closed: () => {
								wsClientRef = null
							},
						},
					}),
				)
			: null

	// Store reference for cleanup
	if (wsLink) {
		wsClientRef = (wsLink as unknown as { client: WsClient }).client
	}

	const splitLink = wsLink
		? split(
				({ query }) => {
					const definition = getMainDefinition(query as DocumentNode)
					return definition.kind === "OperationDefinition" && definition.operation === "subscription"
				},
				wsLink,
				httpLink,
			)
		: httpLink

	// Build the link chain
	const linkChain =
		typeof window !== "undefined"
			? from([notificationErrorFilter, splitLink])
			: httpLink

	return new ApolloClient({
		cache: new InMemoryCache({
			typePolicies: {
				Query: {
					fields: {
						getCurrentCashBalance: { merge: mergeField },
						getSalesReport: { merge: mergeField },
						notifications: { merge: mergeField },
						getAccountTransactions: { merge: mergeField },
						listProductsWithFilter: { merge: mergeField },
						getSales: { merge: mergeField },
						getSalesMetrics: { merge: mergeField },
						getPendingJoinRequests: { merge: mergeField },
						getAllJoinRequests: { merge: mergeField },
						getUserJoinRequest: { merge: mergeField },
						settings: { merge: mergeField },
						getCategories: { merge: mergeField },
						getAnalyticsMetrics: { merge: mergeField },
						getSalesTrend: { merge: mergeField },
						getTopProducts: { merge: mergeField },
						getProductPerformance: { merge: mergeField },
						getAnalyticsTransactions: { merge: mergeField },
						getInventoryReport: { merge: mergeField },
					},
				},
			},
		}),
		// Type assertion needed due to workspace @apollo/client version differences
		link: linkChain as any,
		defaultOptions: {
			watchQuery: {
				errorPolicy: "ignore",
				fetchPolicy: "cache-and-network",
			},
			query: {
				errorPolicy: "all",
			},
			mutate: {
				errorPolicy: "all",
			},
		},
	})
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
	const session = useSession()
	const isAuthenticated = session.status === "authenticated" && !!session?.data?.user?.token

	return (
		<ApolloNextAppProvider makeClient={() => makeClient(isAuthenticated ? session?.data?.user?.token : undefined, session?.data?.user?.storeId)}>
			{children}
		</ApolloNextAppProvider>
	)
}