"use client"

import { ApolloLink, HttpLink, split, from, Observable } from "@apollo/client"
import { ApolloNextAppProvider, ApolloClient, InMemoryCache, SSRMultipartLink } from "@apollo/client-integration-nextjs"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient, Client as WsClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { useSession } from "next-auth/react"
import { onError } from "@apollo/client/link/error";

// Store WebSocket client reference to properly clean up
let wsClientRef: WsClient | null = null;

// Error handling link to suppress authentication errors for subscriptions
const errorLink = onError(({ graphQLErrors, operation }) => {
	// Suppress "Please login to continue" errors for subscriptions
	if (operation.operationName === "OnNotificationAdded") {
		if (graphQLErrors?.some(err => err.message.includes("Please login") || err.message.includes("Unauthorized"))) {
			// Return observable that completes silently to suppress the error
			return Observable.of();
		}
	}
});

const makeClient = (accessToken?: string, storeId?: string) => {
	const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5000/graphql";
	const wsUrl = graphqlUrl.replace(/^http/, "ws");

	const httpLink = new HttpLink({
		uri: graphqlUrl,
		headers: {
			"Authorization": accessToken ? `Bearer ${accessToken}` : "",
			"x-store-id": storeId || ""
		}
	})

	// Clean up existing WebSocket client if authentication state changed
	if (wsClientRef && !accessToken) {
		wsClientRef.dispose();
		wsClientRef = null;
	}

	// Only create WebSocket link if user is authenticated
	const wsLink = typeof window !== "undefined" && accessToken
		? new GraphQLWsLink(
			createClient({
				url: wsUrl,
				connectionParams: {
					Authorization: `Bearer ${accessToken}`,
					"x-store-id": storeId || ""
				},
				retryAttempts: 0, // Don't retry on auth failures
				shouldRetry: () => false,
				on: {
					error: () => {
						// Silently handle WebSocket errors
					},
					closed: () => {
						// Connection closed, clean up
						wsClientRef = null;
					},
				},
			})
		)
		: null;

	// Store reference for cleanup
	if (wsLink && wsLink.request) {
		wsClientRef = (wsLink as any).client as WsClient;
	}

	const splitLink = wsLink
		? split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return (
					definition.kind === "OperationDefinition" &&
					definition.operation === "subscription"
				);
			},
			wsLink,
			httpLink
		)
		: httpLink;

	// Build the link chain with error handling
	const linkChain = typeof window !== "undefined"
		? from([errorLink, new SSRMultipartLink({ stripDefer: true }), splitLink])
		: httpLink;

	return new ApolloClient({
		cache: new InMemoryCache({
			typePolicies: {
				Query: {
					fields: {
						// Custom merge function for getCurrentCashBalance to prevent cache data loss warning
						getCurrentCashBalance: {
							merge: (_existing, incoming) => incoming,
						},
						// Custom merge function for getSalesReport with pagination
						getSalesReport: {
							merge: (_existing, incoming) => incoming,
						},
						// Custom merge function for notifications
						notifications: {
							merge: (_existing, incoming) => incoming,
						},
						// Custom merge function for getAccountTransactions to prevent cache data loss warning
						getAccountTransactions: {
							merge: (_existing, incoming) => incoming,
						},
						// Custom merge function for listProductsWithFilter (paginated products)
						listProductsWithFilter: {
							merge: (_existing, incoming) => incoming,
						},
						// Custom merge functions for sales queries
						getSales: {
							merge: (_existing, incoming) => incoming,
						},
						getSalesMetrics: {
							merge: (_existing, incoming) => incoming,
						},
						// Custom merge functions for member request queries
						getPendingJoinRequests: {
							merge: (_existing, incoming) => incoming,
						},
						getAllJoinRequests: {
							merge: (_existing, incoming) => incoming,
						},
						getUserJoinRequest: {
							merge: (_existing, incoming) => incoming,
						},
						// Custom merge function for settings
						settings: {
							merge: (_existing, incoming) => incoming,
						},
						// Custom merge function for categories
						getCategories: {
							merge: (_existing, incoming) => incoming,
						},
						// Custom merge functions for analytics/report queries
						getAnalyticsMetrics: {
							merge: (_existing, incoming) => incoming,
						},
						getSalesTrend: {
							merge: (_existing, incoming) => incoming,
						},
						getTopProducts: {
							merge: (_existing, incoming) => incoming,
						},
						getProductPerformance: {
							merge: (_existing, incoming) => incoming,
						},
						getAnalyticsTransactions: {
							merge: (_existing, incoming) => incoming,
						},
						getInventoryReport: {
							merge: (_existing, incoming) => incoming,
						},
					},
				},
			},
		}),
		link: linkChain,
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
	const isAuthenticated = session.status === "authenticated" && !!session?.data?.user?.token;

	return (
		<ApolloNextAppProvider makeClient={() => makeClient(isAuthenticated ? session?.data?.user?.token : undefined, session?.data?.user?.storeId)}>
			{children}
		</ApolloNextAppProvider>
	)
}