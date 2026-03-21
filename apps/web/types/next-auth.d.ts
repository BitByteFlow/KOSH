import NextAuth, { DefaultSession, User } from "next-auth";

declare module "next-auth" {
	interface User {
		token: string;
		id: string;
		image: string;
		username: string;
		email: string;
		storeId: string;
		storeName: string;
	}

	interface Session {
		user: User & DefaultSession["user"];
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		accessToken: string;
		storeId: string;
		storeName: string;
	}
}
