"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@kosh/ui/components/button";
import { Card } from "@kosh/ui/components/card";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log to monitoring service in production
		if (process.env.NODE_ENV === "production") {
			// TODO: Add your error monitoring service here (Sentry, LogRocket, etc.)
			// Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
			console.error("[ErrorBoundary] Production error:", error, errorInfo.componentStack);
		}

		// Call custom error handler if provided
		this.props.onError?.(error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
		window.location.href = "/";
	};

	handleRetry = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-screen flex items-center justify-center bg-background p-4">
					<Card className="max-w-md w-full p-6 space-y-4">
						<div className="flex items-center gap-3 text-destructive">
							<AlertCircle className="h-6 w-6" />
							<h2 className="text-lg font-semibold">Something went wrong</h2>
						</div>

						<p className="text-sm text-muted-foreground">
							An unexpected error occurred. Please try refreshing the page or
							contact support if the problem persists.
						</p>

						{process.env.NODE_ENV === "development" && this.state.error && (
							<div className="p-3 bg-muted rounded-md overflow-auto max-h-48">
								<p className="text-xs font-mono text-destructive">
									{this.state.error.toString()}
								</p>
							</div>
						)}

						<div className="flex gap-2">
							<Button
								onClick={this.handleRetry}
								className="flex-1"
							>
								<RefreshCw className="h-4 w-4 mr-2" />
								Try Again
							</Button>
							<Button
								onClick={this.handleReset}
								variant="outline"
								className="flex-1"
							>
								Go Home
							</Button>
						</div>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}

// Hook for functional components (requires manual error catching)
export function useErrorHandler(onError?: (error: Error) => void) {
	const handleError = (error: Error) => {
		if (onError) {
			onError(error);
		} else {
			throw error;
		}
	};

	return { handleError };
}
