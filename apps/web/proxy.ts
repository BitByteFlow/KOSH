import { NextRequest, NextResponse } from "next/server";
import { auth } from "./app/api/auth/[...nextauth]/auth";

const proxy = async (req: NextRequest) => {
	const path = req.nextUrl.pathname;
	const session = await auth();
	// console.log("this is expires: ", session?.user.storeId);
	const isPublicPath = path === "/auth/get-started" || path === "/";
	if (session?.expires && new Date(session.expires) < new Date()) {
		return NextResponse.redirect(new URL("/auth/get-started", req.url));
	}
	if (isPublicPath && session?.user) {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	const privateRoutes = [
		"/dashboard",
		"/sales",
		"/inventory",
		"/reports-analytics",
		"settings",
	];
	const isPrivateRoute = privateRoutes.includes(path);

	if (isPrivateRoute && !session) {
		return NextResponse.redirect(new URL("/auth/get-started", req.url));
	}
	return NextResponse.next();
};

export default proxy;

export const config = {
	matcher: [
		"/",
		"/auth/get-started",
		"/dashboard/:path*",
		"/inventory/:path*",
		"/sales/:path*",
		"/reports-analytics/:path*",
		"/settings/:path*",
	],
};
