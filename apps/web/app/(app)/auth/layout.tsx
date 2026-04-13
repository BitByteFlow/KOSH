import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Get Started",
	description:
		"Sign in to Kosh to start managing your business. Secure authentication with Google sign-in.",
	robots: {
		index: false,
		follow: false,
	},
	openGraph: {
		title: "Get Started - Kosh",
		description:
			"Sign in to Kosh to start managing your business. Secure authentication with Google sign-in.",
	},
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
