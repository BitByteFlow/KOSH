import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const siteUrl =
		process.env.NEXT_PUBLIC_SITE_URL || "https://koshnp.vercel.app";

	return {
		rules: [
			{
				userAgent: "*",
				allow: ["/"],
				disallow: [
					"/dashboard/",
					"/inventory/",
					"/sales/",
					"/reports-analytics/",
					"/settings/",
					"/auth/",
					"/api/",
				],
			},
			{
				userAgent: "Googlebot",
				allow: ["/"],
				disallow: [
					"/dashboard/",
					"/inventory/",
					"/sales/",
					"/reports-analytics/",
					"/settings/",
					"/auth/",
					"/api/",
				],
			},
		],
		sitemap: `${siteUrl}/sitemap.xml`,
	};
}
