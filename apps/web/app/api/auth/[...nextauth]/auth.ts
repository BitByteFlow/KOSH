import NextAuth, { NextAuthResult, Profile } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { retryApiCall, CircuitBreaker } from "@/lib/index";

const circuitBreaker = new CircuitBreaker();

const backendURL = process.env.BACKEND_URL;

if (!backendURL) {
	console.error("BACKEND_URL environment variable is not set");
}

type GithubProfile = Profile & {
	login: string;
	avatar_url: string;
	id: string;
	email?: string | null;
};

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
	throw new Error("Missing GitHub OAuth credentials in environment variables.");
}

if (!process.env.AUTH_SECRET) {
	throw new Error("Missing AUTH_SECRET in environment variables.");
}

const postJson = async (url: string, body: any): Promise<Response> => {
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		throw Object.assign(new Error(`HTTP error! status: ${response.status}`), {
			response,
		});
	}

	return response;
};

const nextAuth = NextAuth({
	providers: [
		GitHubProvider({
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			authorization: { params: { scope: "read:user user:email" } },
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 60 * 60 * 24 * 7,
	},
	secret: process.env.AUTH_SECRET,

	callbacks: {
		async signIn({ account, profile, user }) {
			if (account?.provider !== "github") return true;

			const githubProfile = profile as GithubProfile;
			if (!githubProfile?.email || !githubProfile.login || !githubProfile.id) {
				return false;
			}

			try {
				const loginResponse = await retryApiCall(() =>
					circuitBreaker.call(() =>
						postJson(`${backendURL}/users/login`, {
							githubId: githubProfile.id,
							email: githubProfile.email,
						}),
					),
				);
				const loginData = await loginResponse.json();
				user.id = loginData.user.id;
				user.token = loginData.token;
			} catch (error: any) {
				console.error(`Login failed for user: ${githubProfile.email}`, error);
				if (
					error.response &&
					(error.response.status === 404 || error.response.status === 400)
				) {
					try {
						const signUpResponse = await retryApiCall(() =>
							circuitBreaker.call(() =>
								postJson(`${backendURL}/users/register`, {
									githubId: githubProfile.id,
									email: githubProfile.email,
									username: githubProfile.login,
									image: githubProfile.avatar_url,
								}),
							),
						);
						const signUpData = await signUpResponse.json();
						user.id = signUpData.user.id;
						user.token = signUpData.token;
					} catch (registerError: any) {
						console.log("Failed to signup user Email: ", githubProfile.email);
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
				const githubProfile = profile as GithubProfile;
				token.id = user.id;
				token.email = githubProfile.email;
				token.name = githubProfile.login;
				token.picture = githubProfile.avatar_url;
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
