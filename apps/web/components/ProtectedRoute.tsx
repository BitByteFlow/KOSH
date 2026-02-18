"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Loading from "./Loading";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/get-started");
		}
	}, [status, router]);

	if (status === "loading") {
		return <Loading />;
	}

	if (status === "authenticated") {
		return <>{children}</>;
	}

	if (pathname === "/auth/get-started") {
		return <>{children}</>;
	}

	return null;
};