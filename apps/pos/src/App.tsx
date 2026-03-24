import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import {
	ProtectedRoute,
	PublicRoute,
	OnboardingRoute,
} from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import CheckoutPage from "./pages/CheckoutPage";
import TransactionsPage from "./pages/TransactionsPage";
import DailyTransactionsPage from "./pages/DailyTransactionsPage";

function App() {
	return (
		<BrowserRouter>
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
							element={<LoginPage />}
						/>
					</Route>

					<Route element={<OnboardingRoute />}>
						<Route
							path="/get-started"
							element={<OnboardingPage />}
						/>
					</Route>

					<Route element={<ProtectedRoute />}>
						<Route
							path="/"
							element={<Layout />}
						>
							<Route
								index
								element={<CheckoutPage />}
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
								element={<TransactionsPage />}
							/>
							<Route
								path="daily-transactions"
								element={<DailyTransactionsPage />}
							/>
						</Route>
					</Route>

					<Route
						path="*"
						element={<LoginPage />}
					/>
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
