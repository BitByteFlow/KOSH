"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { startTransition } from "react";
import {
	LayoutGrid,
	Layers,
	BarChart3,
	Settings,
	ShoppingCart,
	BookOpen,
	HelpCircle,
	ChevronDown,
	LogOut,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	useSidebar,
} from "@kosh/ui/components/sidebar";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@kosh/ui/components/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@kosh/ui/components/dropdown-menu";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Image from "next/image";

const menuItems = [
	{ title: "Dashboard", icon: LayoutGrid, url: "/dashboard" },
	{ title: "Sales", icon: ShoppingCart, url: "/sales" },
	{ title: "Inventory", icon: Layers, url: "/inventory" },
	{ title: "Reports & Analytics", icon: BarChart3, url: "/reports-analytics" },
	{ title: "Settings", icon: Settings, url: "/settings" },
];

const supportItems = [
	{ title: "User Guide", icon: BookOpen, url: "/user-guide" },
	{ title: "FAQ", icon: HelpCircle, url: "/faq" },
];

const DashboardSidebar = () => {
	const pathname = usePathname();
	const router = useRouter();
	const session = useSession();
	const { setOpen } = useSidebar();
	const lastBreakpoint = React.useRef<"mobile" | "medium" | "desktop" | null>(
		null,
	);

	React.useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			let currentBreakpoint: "mobile" | "medium" | "desktop" = "desktop";

			if (width < 768) {
				currentBreakpoint = "mobile";
			} else if (width < 1200) {
				currentBreakpoint = "medium";
			}

			if (currentBreakpoint !== lastBreakpoint.current) {
				if (currentBreakpoint === "medium") {
					setOpen(false);
				} else if (currentBreakpoint === "desktop") {
					setOpen(true);
				}
				lastBreakpoint.current = currentBreakpoint;
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [setOpen]);

	const handleLogout = async () => {
		await signOut({ redirect: true, redirectTo: "/auth/get-started" });
	};

	const handleNavigate = React.useCallback(
		(url: string) => {
			// Use startTransition to keep UI responsive during navigation
			startTransition(() => {
				router.push(url);
			});
		},
		[router],
	);

	return (
		<Sidebar
			className="border-r border-sidebar-border bg-sidebar flex-col max-h-screen"
			collapsible="icon"
			side="left"
		>
			<SidebarHeader className="gap-4">
				<div className="flex items-center group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:gap-0 group-data-[state=collapsed]:px-0">
					<Image src="/logo.svg" alt="Logo" width={32} height={32} className="h-8 w-8" loading="eager" priority />
					<div className="overflow-hidden max-w-50 opacity-100 group-data-[state=collapsed]:max-w-0 group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:w-0 transition-[max-width,opacity] duration-200 ease-linear">
						<span className="text-xl italic font-semibold tracking-tight text-foreground whitespace-nowrap ml-1">
							Kosh
						</span>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent className="custom-scrollbar">
				<SidebarGroup>
					<SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-2">
						Menu
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => {
								const isActive = pathname.startsWith(item.url);
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											className="mt-2 hover:cursor-pointer"
											onClick={() => handleNavigate(item.url)}
											isActive={isActive}
											tooltip={item.title}
										>
											<item.icon
												className={`h-5 w-5 ${
													isActive
														? "text-primary scale-110"
														: "text-muted-foreground hover:scale-110"
												}`}
											/>
											<div
												className={`flex items-center gap-3 py-2.5 px-2 w-full rounded-lg transition-[max-width,opacity,width,padding] duration-200 ease-linear opacity-100 max-w-50 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:p-0 ${
													isActive
														? "bg-accent text-accent-foreground font-semibold"
														: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
												}`}
											>
												<span
													className={`${isActive ? "text-primary text-base" : "text-base"} whitespace-nowrap`}
												>
													{item.title}
												</span>
											</div>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-2">
						Help & Support
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{supportItems.map((item) => {
								const isActive = pathname.startsWith(item.url);
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											isActive={isActive}
											className="mt-2 hover:cursor-pointer"
											onClick={() => handleNavigate(item.url)}
											tooltip={item.title}
										>
											<item.icon
												className={`h-5 w-5 ${
													isActive
														? "text-primary scale-110"
														: "text-muted-foreground hover:scale-110"
												}`}
											/>
											<div
												className={`flex items-center gap-3 py-2.5 px-2 w-full rounded-lg transition-[max-width,opacity,width,padding] duration-200 ease-linear opacity-100 max-w-50 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:p-0 ${
													isActive
														? "bg-accent text-accent-foreground font-semibold"
														: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
												}`}
											>
												<span
													className={`${isActive ? "text-primary text-base" : "text-base"} whitespace-nowrap`}
												>
													{item.title}
												</span>
											</div>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<Avatar className="h-8 w-8 rounded-lg shrink-0">
										<AvatarImage
											src={
												session.data?.user?.image ||
												"https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop"
											}
											alt={session.data?.user?.name || "User"}
										/>
										<AvatarFallback className="rounded-lg">
											{session.data?.user?.name?.slice(0, 2).toUpperCase() ||
												"KH"}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
										<span className="truncate font-semibold">
											{session.data?.user?.name}
										</span>
										<span className="truncate text-xs">
											{session.data?.user?.email}
										</span>
									</div>
									<ChevronDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
								side="bottom"
								align="end"
								sideOffset={4}
							>
								<DropdownMenuItem className="gap-2 p-2">
									<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
										<Avatar className="h-8 w-8 rounded-lg">
											<AvatarImage
												src={session.data?.user?.image || ""}
												alt={session.data?.user?.name || ""}
											/>
											<AvatarFallback className="rounded-lg">
												{session.data?.user?.name?.slice(0, 2).toUpperCase() ||
													"KH"}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{session.data?.user?.name}
											</span>
											<span className="truncate text-xs">
												{session.data?.user?.email}
											</span>
										</div>
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={handleLogout}
									className="text-destructive focus:text-destructive"
								>
									<LogOut className="mr-2 h-4 w-4" />
									<span>Log out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
};

export default DashboardSidebar;
