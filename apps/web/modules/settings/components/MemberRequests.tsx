"use client";

import { useState } from "react";
import { SettingsSection } from "./SettingSection";
import { Button } from "@kosh/ui/components/button";
import { Badge } from "@kosh/ui/components/badge";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@kosh/ui/components/avatar";
import {
	usePendingMemberRequests,
	useHandleJoinRequest,
} from "@/modules/settings/hooks/useMemberRequests";
import { Users, Check, X, Clock, AlertCircle } from "lucide-react";
import { logger } from "@/lib/logger";
import { useStore } from "@/context/StoreContext";

interface MemberRequestData {
	id: string;
	storeId: string;
	userId: string;
	status: "PENDING" | "ACCEPTED" | "REJECTED";
	createdAt: string;
	updatedAt: string;
	user?: {
		id: string;
		username: string;
		email: string;
	};
}

export function MemberRequests() {
	const {
		data: response,
		loading,
		error,
		refetch,
	} = usePendingMemberRequests();
	const { mutate: handleRequest, loading: handling } = useHandleJoinRequest();
	const [processingId, setProcessingId] = useState<string | null>(null);
	const { activeStoreId } = useStore();

	const requests: MemberRequestData[] =
		response?.getPendingJoinRequests.data || [];

	const handleApprove = async (requestId: string) => {
		setProcessingId(requestId);
		try {
			await handleRequest(requestId, {
				status: "ACCEPTED",
				//TODO: handle it properly later
				storeId: activeStoreId || "",
			});
			await refetch();
		} finally {
			setProcessingId(null);
		}
	};

	const handleReject = async (requestId: string) => {
		setProcessingId(requestId);
		try {
			await handleRequest(requestId, {
				status: "REJECTED",
				storeId: activeStoreId || "",
			});
			await refetch();
		} finally {
			setProcessingId(null);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "PENDING":
				return (
					<Badge
						variant="secondary"
						className="gap-1"
					>
						<Clock className="size-3" />
						Pending
					</Badge>
				);
			case "ACCEPTED":
				return (
					<Badge
						variant="default"
						className="gap-1 bg-green-500"
					>
						<Check className="size-3" />
						Accepted
					</Badge>
				);
			case "REJECTED":
				return (
					<Badge
						variant="destructive"
						className="gap-1"
					>
						<X className="size-3" />
						Rejected
					</Badge>
				);
			default:
				return null;
		}
	};

	// const formatDate = (dateString: string) => {
	// 	return new Date(dateString).toLocaleDateString("en-US", {
	// 		month: "short",
	// 		day: "numeric",
	// 		year: "numeric",
	// 		hour: "2-digit",
	// 		minute: "2-digit",
	// 	});
	// };

	const getInitials = (username: string) => {
		return username
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	if (loading) {
		return (
			<SettingsSection
				title="Member Requests"
				description="Review and manage pending store join requests."
			>
				<div className="p-4 bg-background rounded-lg border border-border">
					<div className="flex items-center justify-center py-8 text-muted-foreground animate-pulse">
						Loading requests...
					</div>
				</div>
			</SettingsSection>
		);
	}

	if (error) {
		return (
			<SettingsSection
				title="Member Requests"
				description="Review and manage pending store join requests."
			>
				<div className="p-4 bg-destructive/5 rounded-lg border border-destructive/30">
					<div className="flex items-start gap-3">
						<AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
						<div className="flex-1">
							<h3 className="font-medium text-destructive">
								Failed to load requests
							</h3>
							<p className="text-sm text-muted-foreground mt-1">
								Unable to fetch member requests. Please try again later.
							</p>
						</div>
					</div>
				</div>
			</SettingsSection>
		);
	}

	return (
		<SettingsSection
			title="Member Requests"
			description="Review and manage pending store join requests."
		>
			<div className="p-4 bg-background rounded-lg border border-border">
				{requests.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<Users className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium text-foreground">
							No Pending Requests
						</h3>
						<p className="text-sm text-muted-foreground mt-1">
							There are no pending member requests at this time.
						</p>
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Users className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium text-foreground">
									{requests.length} Pending Request
									{requests.length !== 1 ? "s" : ""}
								</span>
							</div>
						</div>

						<div className="space-y-3">
							{requests.map((request) => (
								<div
									key={request.id}
									className="p-4 bg-muted/50 rounded-lg border border-border hover:border-muted-foreground/30 transition-colors"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex items-start gap-3 flex-1">
											<Avatar size="lg">
												<AvatarImage
													src={undefined}
													alt={request.user?.username || ""}
												/>
												<AvatarFallback className="text-sm">
													{request.user?.username
														? getInitials(request.user.username)
														: "?"}
												</AvatarFallback>
											</Avatar>

											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 flex-wrap">
													<h4 className="font-medium text-foreground">
														{request.user?.username || "Unknown User"}
													</h4>
													{getStatusBadge(request.status)}
												</div>

												<p className="text-sm text-muted-foreground mt-1">
													{request.user?.email || "No email provided"}
												</p>

												<p className="text-xs text-muted-foreground mt-2">
													Requested on {new Date(request.createdAt).toString()}
												</p>
											</div>
										</div>

										{request.status === "PENDING" && (
											<div className="flex items-center gap-2 shrink-0">
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleReject(request.id)}
													disabled={processingId === request.id || handling}
													className="text-destructive hover:text-destructive hover:bg-destructive/10"
												>
													<X className="size-4" />
													Reject
												</Button>
												<Button
													size="sm"
													onClick={() => handleApprove(request.id)}
													disabled={processingId === request.id || handling}
													className="bg-green-600 hover:bg-green-700 text-white"
												>
													<Check className="size-4" />
													Approve
												</Button>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</SettingsSection>
	);
}
