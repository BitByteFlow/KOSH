"use client";

import React, { useState } from "react";
import { Bell, ShoppingCart, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@kosh/ui/components/dropdown-menu";
import { ScrollArea } from "@kosh/ui/components/scroll-area";
import { Badge } from "@kosh/ui/components/badge";
import { useNotifications, useMarkAllNotificationsAsRead } from "../hooks/useNotifications";
import { cn } from "@/lib/utils";

const NotificationDropdown = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { data: response, isLoading } = useNotifications();
	const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();

	const notifications = response?.data || [];
	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (open && unreadCount > 0) {
			markAllAsRead();
		}
	};

	const getIcon = (type: string) => {
		switch (type) {
			case "LOW_STOCK":
				return <ShoppingCart className="w-4 h-4 text-orange-500" />;
			case "INFO":
				return <Info className="w-4 h-4 text-blue-500" />;
			case "SUCCESS":
				return <CheckCircle2 className="w-4 h-4 text-green-500" />;
			case "ALERT":
				return <AlertCircle className="w-4 h-4 text-red-500" />;
			default:
				return <Bell className="w-4 h-4 text-muted-foreground" />;
		}
	};

	return (
		<DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
			<DropdownMenuTrigger asChild>
				<button className="relative p-2 rounded-full hover:bg-muted transition-colors outline-none">
					<Bell className="w-5 h-5 text-muted-foreground" />
					{unreadCount > 0 && (
						<Badge
							className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 hover:bg-red-600"
							variant="destructive"
						>
							{unreadCount > 9 ? "9+" : unreadCount}
						</Badge>
					)}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[380px] p-0 overflow-hidden">
				<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
					<h3 className="font-semibold text-sm">Notifications</h3>
					{unreadCount > 0 && (
						<span className="text-[11px] font-medium text-muted-foreground">
							{unreadCount} unread
						</span>
					)}
				</div>
				<ScrollArea className="h-[400px]">
					{isLoading ? (
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
										<div className="mt-0.5 p-1.5 rounded-full bg-background border flex-shrink-0">
											{getIcon(notification.type)}
										</div>
										<div className="flex flex-col gap-1 flex-1">
											<p className={cn(
												"text-sm leading-tight",
												!notification.isRead ? "font-semibold" : "font-medium text-muted-foreground"
											)}>
												{notification.message}
											</p>
											<span className="text-[11px] text-muted-foreground">
												{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
											</span>
										</div>
										{!notification.isRead && (
											<div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
										)}
									</div>
								</DropdownMenuItem>
							))}
						</div>
					)}
				</ScrollArea>
				<div className="p-2 border-t bg-muted/30 text-center">
					<button className="text-[11px] font-medium text-primary hover:underline">
						View all notifications
					</button>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default NotificationDropdown;
