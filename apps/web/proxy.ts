import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/about", "/auth/get-started"];

const proxy = (req: NextRequest) => {
	const { pathname } = req.nextUrl;

	const isPublicRoute = publicRoutes.some((route) => {
		if (route === "/") {
			return pathname === "/";
		}

		return pathname.startsWith(route);
	});

	const token =
		req.cookies.get("__Secure-next-auth.session-token")?.value ||
		req.cookies.get("next-auth.session-token")?.value ||
		req.cookies.get("__Secure-authjs.session-token")?.value ||
		req.cookies.get("authjs.session-token")?.value;

	const isAuthenticated = !!token;

	if (pathname.startsWith("/auth/get-started") && isAuthenticated) {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	if (!isPublicRoute && !isAuthenticated) {
		const loginUrl = new URL("/auth/get-started", req.url);

		loginUrl.searchParams.set("callbackUrl", pathname);

		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
};

export default proxy;

export const config = {
	matcher: ["/((?!api|_next|.*\\..*).*)"],
};
