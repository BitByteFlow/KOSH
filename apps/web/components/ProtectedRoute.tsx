"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "./Loading";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { data: session, status } = useSession();
	const router = useRouter();

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

	return null;
};