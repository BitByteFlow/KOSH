import { NextRequest, NextResponse } from "next/server";

const proxy = (req: NextRequest) => {
	const path = req.nextUrl.pathname;

	if (
		path.startsWith("/api") ||
		path.startsWith("/_next") ||
		path.includes(".") || // Static files with extensions
		path === "/favicon.ico" ||
		path === "/sitemap.xml" ||
		path === "/robots.txt"
	) {
		return NextResponse.next();
	}

	const publicRoutes = ["/auth/get-started", "/"];

	const token =
		req.cookies.get("next-auth.session-token")?.value ||
		req.cookies.get("authjs.session-token")?.value;
	const isAuthenticated = !!token;

	if (path.startsWith("/auth/get-started") && isAuthenticated) {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	if (
		!publicRoutes.some((route) => path.startsWith(route)) &&
		!isAuthenticated
	) {
		const loginUrl = new URL("/auth/get-started", req.url);
		loginUrl.searchParams.set("callbackUrl", encodeURIComponent(path));
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
};

export default proxy;

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
