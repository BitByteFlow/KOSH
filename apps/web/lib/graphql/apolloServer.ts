import {HttpLink} from "@apollo/client"
import {registerApolloClient, ApolloClient, InMemoryCache} from "@apollo/client-integration-nextjs"
import { auth } from "@/app/api/auth/[...nextauth]/auth"

const {getClient, query, PreloadQuery} = registerApolloClient(async() => {
	const session = await auth()
	const client = new ApolloClient({
		cache: new InMemoryCache(),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		link: new HttpLink({
			uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5000/graphql",
			headers: {
				"Authorization": session?.user?.token ? `Bearer ${session.user.token}` : "",
				"x-store-id": session?.user?.storeId || ""
			}
		}) as any

	})
	return client
})

export {getClient, query, PreloadQuery}
