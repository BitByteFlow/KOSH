import NextAuth, { type NextAuthResult, type Profile } from "next-auth";
import { retryApiCall, CircuitBreaker } from "@/lib/index";
import GoogleProvider from "next-auth/providers/google";
import { baseApiClient } from "@/lib/api/baseRequest";
import { API_ENDPOINTS } from "@/lib/api/config";
import { ApiError } from "@/lib/api/errors";

const circuitBreaker = new CircuitBreaker();

interface GoogleProfile extends Profile {
	sub: string;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	email: string;
	email_verified: boolean;
	locale: string;
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
	throw new Error("Missing Google OAuth credentials in environment variables.");
}

if (!process.env.AUTH_SECRET) {
	throw new Error("Missing AUTH_SECRET in environment variables.");
}

interface AuthResponse {
	user: {
		id: string;
		email: string;
		username: string;
	};
	token: string;
}

const nextAuth = NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 60 * 60 * 24 * 7,
	},
	secret: process.env.AUTH_SECRET,

	callbacks: {
		async signIn({ account, profile, user }) {
			if (account?.provider !== "google") return true;

			const googleProfile = profile as GoogleProfile;
			if (!googleProfile?.email || !googleProfile.sub) {
				return false;
			}

			try {
				const loginData = await retryApiCall(() =>
					circuitBreaker.call(() =>
						baseApiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, {
							googleId: googleProfile.sub,
							email: googleProfile.email,
						}),
					),
				);
				
				user.id = loginData.user.id;
				user.token = loginData.token;
			} catch (error: any) {
				console.error(`Login failed for user: ${googleProfile.email}`, error);
				
				// Handle user not found (404) or missing details (400) by attempting registration
				const statusCode = error instanceof ApiError ? error.statusCode : (error.response?.status || 500);
				
				if (statusCode === 404 || statusCode === 400) {
					try {
						const signUpData = await retryApiCall(() =>
							circuitBreaker.call(() =>
								baseApiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, {
									googleId: googleProfile.sub,
									email: googleProfile.email,
									username: googleProfile.name,
									image: googleProfile.picture,
								}),
							),
						);
						
						user.id = signUpData.user.id;
						user.token = signUpData.token;
					} catch (registerError: any) {
						console.log("Failed to signup user Email: ", googleProfile.email);
						return false;
					}
				} else {
					return false;
				}
			}
			return true;
		},

		async jwt({ token, account, user, profile, trigger, session }) {
			if (trigger === "update" && session.user) {
				return { ...token, ...session };
			}
			if (account && profile) {
				const googleProfile = profile as GoogleProfile;
				token.id = user.id;
				token.email = googleProfile.email;
				token.name = googleProfile.name;
				token.picture = googleProfile.picture;
				if (user.token) {
					token.accessToken = user.token;
				}
			}
			return token;
		},

		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.email = token.email as string;
				session.user.name = token.name as string;
				session.user.image = token.picture as string;
				session.user.token = token.accessToken as string;
			}
			return session;
		},
	},
});

const handlers: NextAuthResult["handlers"] = nextAuth.handlers;
const auth: NextAuthResult["auth"] = nextAuth.auth;
const signIn: NextAuthResult["signIn"] = nextAuth.signIn;
const signOut: NextAuthResult["signOut"] = nextAuth.signOut;

export { handlers, auth, signIn, signOut };
