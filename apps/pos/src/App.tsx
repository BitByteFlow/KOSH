import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import {
	ProtectedRoute,
	PublicRoute,
	OnboardingRoute,
} from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Loading from "./components/Loading";
import { PageViewTracker } from "./components/PageViewTracker";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const DailyTransactionsPage = lazy(
	() => import("./pages/DailyTransactionsPage"),
);

function App() {
	return (
		<BrowserRouter>
			<PageViewTracker />
			<AuthProvider>
				<Toaster
					position="top-center"
					expand={true}
					richColors
					closeButton
				/>
				<Routes>
					<Route element={<PublicRoute />}>
						<Route
							path="/login"
							element={
								<Suspense fallback={<Loading />}>
									<LoginPage />
								</Suspense>
							}
						/>
					</Route>

					<Route element={<OnboardingRoute />}>
						<Route
							path="/get-started"
							element={
								<Suspense fallback={<Loading />}>
									<OnboardingPage />
								</Suspense>
							}
						/>
					</Route>

					<Route element={<ProtectedRoute />}>
						<Route
							path="/"
							element={<Layout />}
						>
							<Route
								index
								element={
									<Suspense fallback={<Loading />}>
										<CheckoutPage />
									</Suspense>
								}
							/>
							<Route
								path="sales"
								element={
									<Navigate
										to="/sales-history"
										replace
									/>
								}
							/>
							<Route
								path="sales-history"
								element={
									<Suspense fallback={<Loading />}>
										<TransactionsPage />
									</Suspense>
								}
							/>
							<Route
								path="daily-transactions"
								element={
									<Suspense fallback={<Loading />}>
										<DailyTransactionsPage />
									</Suspense>
								}
							/>
						</Route>
					</Route>

					<Route
						path="*"
						element={
							<Suspense fallback={<Loading />}>
								<LoginPage />
							</Suspense>
						}
					/>
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
