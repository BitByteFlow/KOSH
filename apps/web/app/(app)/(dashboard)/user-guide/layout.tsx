import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "User Guide",
	description:
		"Learn how to use Kosh with step-by-step guides, tutorials, and documentation.",
	openGraph: {
		title: "User Guide - Kosh",
		description:
			"Learn how to use Kosh with step-by-step guides, tutorials, and documentation.",
	},
};

export default function UserGuideLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
