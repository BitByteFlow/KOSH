"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
	LayoutGrid,
	Layers,
	BarChart3,
	Settings,
	ShoppingCart,
	BookOpen,
	HelpCircle,
	Search,
	Bolt,
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
	SidebarTrigger,
} from "@kosh/ui/components/sidebar";
import { Input } from "@kosh/ui/components/input";
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
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

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
	const session = useSession()
	const handleLogout = async () => {
		await signOut({
			redirect: true,
			redirectTo: "/auth/get-started"
		})
	}
	return (
		<Sidebar
			className="border-r border-gray-200 bg-white flex-col max-h-screen"
			collapsible="icon"
			side="left"
		>
			<SidebarHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 overflow-hidden transition-all duration-200 ease-linear max-w-[200px] opacity-100 group-data-[state=collapsed]:max-w-0 group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:gap-0">
						<div className="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-900 text-white shrink-0">
							<Bolt className="h-5 w-5" />
						</div>
						<span className="text-xl font-semibold tracking-tight text-gray-900 whitespace-nowrap">
							KOSH
						</span>
					</div>
					<SidebarTrigger className="hover:cursor-pointer transition-colors text-gray-400 hover:text-gray-600 ml-auto" />
				</div>

				<div className="mt-6 relative group overflow-hidden transition-all duration-300 ease-in-out group-data-[state=collapsed]:h-0 group-data-[state=collapsed]:mt-0 group-data-[state=collapsed]:opacity-0">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
					<Input
						placeholder="Search"
						className="pl-9 py-2 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-gray-200 placeholder:text-gray-400 rounded-md"
					/>
				</div>
			</SidebarHeader>

			<SidebarContent className="custom-scrollbar">
				<SidebarGroup>
					<SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-gray-400 px-2">
						Menu
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => {
								const isActive = pathname.startsWith(item.url);
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton className="mt-2 hover:cursor-pointer" onClick={() => router.push(item.url)}>
											<item.icon
												className={`h-5 w-5 transition-transform ${isActive
													? "text-gray-900"
													: "text-gray-500 hover:scale-105"
													}`}
											/>
											<div
												className={`flex items-center gap-3 py-2.5 px-2 w-full rounded-lg transition-colors overflow-hidden transition-all duration-200 ease-linear opacity-100 max-w-[200px] group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:p-0 ${isActive
													? "bg-gray-50 text-gray-900"
													: "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
													}`}
											>
												<span className="text-base font-medium whitespace-nowrap">
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
					<SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-gray-400 px-2">
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
											onClick={() => router.push(item.url)}
										>
											<item.icon
												className={`h-5 w-5 transition-transform ${isActive
													? "text-gray-900"
													: "text-gray-500 hover:scale-105"
													}`}
											/>
											<div
												className={`flex items-center gap-3 py-2.5 px-2 w-full rounded-lg transition-colors overflow-hidden transition-all duration-200 ease-linear opacity-100 max-w-[200px] group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:p-0 ${isActive
													? "bg-gray-50 text-gray-900"
													: "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
													}`}
											>
												<span className="text-base font-medium whitespace-nowrap">
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
											src={session.data?.user?.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop"}
											alt={session.data?.user?.name || "User"}
										/>
										<AvatarFallback className="rounded-lg">
											{session.data?.user?.name?.slice(0, 2).toUpperCase() || "KH"}
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
												{session.data?.user?.name?.slice(0, 2).toUpperCase() || "KH"}
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
								<DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
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
