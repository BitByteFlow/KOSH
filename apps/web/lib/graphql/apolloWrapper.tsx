"use client"

import { ApolloLink, HttpLink, split } from "@apollo/client"
import { ApolloNextAppProvider, ApolloClient, InMemoryCache, SSRMultipartLink } from "@apollo/client-integration-nextjs"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { useSession } from "next-auth/react"

const makeClient = (accessToken?: string) => {
	const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql";
	const wsUrl = graphqlUrl.replace(/^http/, "ws");

	const httpLink = new HttpLink({
		uri: graphqlUrl,
		headers: {
			"Authorization": accessToken ? `Bearer ${accessToken}` : ""
		}
	})

	const wsLink = typeof window !== "undefined"
		? new GraphQLWsLink(
			createClient({
				url: wsUrl,
				connectionParams: () => ({
					Authorization: accessToken ? `Bearer ${accessToken}` : "",
				}),
			})
		)
		: null;

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

	return new ApolloClient({
		cache: new InMemoryCache(),
		link: typeof window !== "undefined" ? ApolloLink.from([
			new SSRMultipartLink({ stripDefer: true }),
			splitLink,
		]) : httpLink
	})
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
	const session = useSession()

	return (
		<ApolloNextAppProvider makeClient={() => makeClient(session?.data?.user?.token)}>
			{children}
		</ApolloNextAppProvider>
	)
}