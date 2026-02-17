"use client"

import { ApolloLink, HttpLink } from "@apollo/client"
import { ApolloNextAppProvider, ApolloClient, InMemoryCache, SSRMultipartLink } from "@apollo/client-integration-nextjs"
import { useSession } from "next-auth/react"

const makeClient = (accessToken?: string) => {
	const httpLink = new HttpLink({
		uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql",
		headers: {
			"Authorization": accessToken ? `Bearer ${accessToken}` : ""
		}
	})

	return new ApolloClient({
		cache: new InMemoryCache(),
		link: typeof window !== "undefined" ? ApolloLink.from([
			new SSRMultipartLink({ stripDefer: true }),
			httpLink,
		]) : httpLink
	})
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
	const { data: session } = useSession()

	return (
		<ApolloNextAppProvider makeClient={() => makeClient(session?.user?.token)}>
			{children}
		</ApolloNextAppProvider>
	)
}