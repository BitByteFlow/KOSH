"use client";

import React, { useState } from "react";
import { Bell, ShoppingCart, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@kosh/ui/components/dropdown-menu";
import { ScrollArea } from "@kosh/ui/components/scroll-area";
import { Badge } from "@kosh/ui/components/badge";
import {
	useNotifications,
	useMarkAllNotificationsAsRead,
} from "../hooks/useNotifications";
import { cn } from "@/lib/utils";
import { NotificationType } from "../../../services/notifications.service";
import { Button } from "@kosh/ui/components/button";
import { useSession } from "next-auth/react";

const NotificationDropdown = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { data: session, status } = useSession();
	const { data: response, loading } = useNotifications();
	const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();

	const isAuthenticated = status === "authenticated" && !!session?.user?.token;
	const notifications = isAuthenticated
		? response?.notifications?.data || []
		: [];
	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (open && unreadCount > 0 && isAuthenticated) {
			markAllAsRead();
		}
	};

	const getIcon = (type: NotificationType) => {
		switch (type) {
			case NotificationType.LOW_STOCK:
				return <ShoppingCart className="w-4 h-4 text-orange-500" />;
			case NotificationType.NEW_FEATURE_ADDED:
				return <CheckCircle2 className="w-4 h-4 text-green-500" />;
			default:
				return <Bell className="w-4 h-4 text-muted-foreground" />;
		}
	};

	return (
		<DropdownMenu
			open={isOpen}
			onOpenChange={handleOpenChange}
			modal={false}
		>
			<DropdownMenuTrigger asChild>
				<Button
					variant={"ghost"}
					className="relative p-2 rounded-full hover:bg-muted transition-colors outline-none hover:cursor-pointer"
				>
					<Bell className="w-5 h-5 text-muted-foreground" />
					{unreadCount > 0 && (
						<Badge
							className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 hover:bg-red-600"
							variant="destructive"
						>
							{unreadCount > 9 ? "9+" : unreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-95 p-0 overflow-hidden border-border"
			>
				<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
					<h3 className="font-semibold text-base tracking-tight">
						Notifications
					</h3>
					{unreadCount > 0 && (
						<span className="text-sm font-medium text-muted-foreground">
							{unreadCount} unread
						</span>
					)}
				</div>
				<ScrollArea className="h-100">
					{!isAuthenticated ? (
						<div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground px-4">
							<Bell className="w-8 h-8 opacity-20" />
							<p className="text-sm text-center">
								Please log in to view notifications
							</p>
						</div>
					) : loading ? (
						<div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
							Loading notifications...
						</div>
					) : notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
							<Bell className="w-8 h-8 opacity-20" />
							<p className="text-sm">No notifications yet</p>
						</div>
					) : (
						<div className="flex flex-col">
							{notifications.map((notification) => (
								<DropdownMenuItem
									key={notification.id}
									className={cn(
										"flex flex-col items-start gap-1 p-4 cursor-default focus:bg-muted/50 border-b last:border-0",
										!notification.isRead && "bg-primary/5 focus:bg-primary/10",
									)}
								>
									<div className="flex items-start gap-3 w-full">
										<div className="mt-0.5 p-1.5 rounded-full bg-background border shrink-0">
											{getIcon(notification.type)}
										</div>
										<div className="flex flex-col gap-1 flex-1">
											<p
												className={cn(
													"text-sm leading-tight",
													!notification.isRead
														? "font-semibold"
														: "font-medium text-muted-foreground",
												)}
											>
												{notification.message}
											</p>
											<span className="text-sm text-muted-foreground">
												{formatDistanceToNow(new Date(notification.createdAt), {
													addSuffix: true,
												})}
											</span>
										</div>
										{!notification.isRead && (
											<div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
										)}
									</div>
								</DropdownMenuItem>
							))}
						</div>
					)}
				</ScrollArea>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default NotificationDropdown;
