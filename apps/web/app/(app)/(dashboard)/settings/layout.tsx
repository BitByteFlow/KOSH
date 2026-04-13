import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Settings",
	description:
		"Manage your store configuration, account preferences, and notification settings.",
	openGraph: {
		title: "Settings - Kosh",
		description:
			"Manage your store configuration, account preferences, and notification settings.",
	},
};

export default function SettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
