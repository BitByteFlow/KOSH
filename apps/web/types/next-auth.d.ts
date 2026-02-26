import NextAuth, { DefaultSession, User } from "next-auth";

declare module "next-auth" {
	interface User {
		token: string;
		id: string
		image: string
		username: string
		email: string
	}
}
