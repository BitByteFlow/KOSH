import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

export const ProtectedRoute: React.FC = () => {
	const { isAuthenticated, isLoading, needsOnboarding } = useAuth();

	if (isLoading) return <Loading />;
	if (!isAuthenticated)
		return (
			<Navigate
				to="/login"
				replace
			/>
		);
	if (needsOnboarding)
		return (
			<Navigate
				to="/get-started"
				replace
			/>
		);

	return <Outlet />;
};

export const PublicRoute: React.FC = () => {
	const { isAuthenticated, isLoading, needsOnboarding } = useAuth();

	if (isLoading) return <Loading />;
	if (isAuthenticated && !needsOnboarding)
		return (
			<Navigate
				to="/"
				replace
			/>
		);
	if (isAuthenticated && needsOnboarding)
		return (
			<Navigate
				to="/get-started"
				replace
			/>
		);

	return <Outlet />;
};

export const OnboardingRoute: React.FC = () => {
	const { isAuthenticated, isLoading, needsOnboarding } = useAuth();

	if (isLoading) return <Loading />;
	if (!isAuthenticated)
		return (
			<Navigate
				to="/login"
				replace
			/>
		);
	if (isAuthenticated && !needsOnboarding)
		return (
			<Navigate
				to="/"
				replace
			/>
		);

	return <Outlet />;
};
