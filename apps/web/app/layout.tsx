import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/query/providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kosh.app";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Kosh";
const siteDescription =
	process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
	"Modern POS and business management platform for tracking sales, inventory, and analytics";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: `${siteName} - Modern POS & Business Management`,
		template: `%s | ${siteName}`,
	},
	description: siteDescription,
	keywords: [
		"POS",
		"point of sale",
		"business management",
		"inventory management",
		"sales tracking",
		"analytics dashboard",
		"retail management",
		"cash management",
		"business analytics",
		"POS system",
		"inventory tracking",
		"sales reports",
	],
	authors: [{ name: siteName }],
	creator: siteName,
	publisher: siteName,
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: siteUrl,
		title: siteName,
		description: siteDescription,
		siteName: siteName,
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: siteName,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: siteName,
		description: siteDescription,
		images: ["/og-image.png"],
		creator: "@kosh",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	verification: {
		// Add your verification codes here
		// google: 'your-google-verification-code',
		// yandex: 'your-yandex-verification-code',
	},
	category: "Business",
};

export const viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
		>
			<body className={`${inter.variable} antialiased`}>
				<ErrorBoundary>
					<Providers>{children}</Providers>
				</ErrorBoundary>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
