"use client";

import * as React from "react";
import {
	LayoutGrid,
	Box,
	Layers,
	BarChart3,
	Settings,
	BookOpen,
	HelpCircle,
	Search,
	Bolt,
	ChevronDown,
	PanelLeft,
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
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
	{ title: "Dashboard", icon: LayoutGrid, url: "#" },
	{ title: "Catalog", icon: Box, url: "#" },
	{ title: "Inventory", icon: Layers, url: "#" },
	{ title: "Reports", icon: BarChart3, url: "#" },
	{ title: "Settings", icon: Settings, url: "#" },
];

const supportItems = [
	{ title: "User Guide", icon: BookOpen, url: "#" },
	{ title: "FAQ", icon: HelpCircle, url: "#", active: true },
];

const DashboardSidebar = () => {
	const { toggleSidebar } = useSidebar();

	return (
		<Sidebar className="border-r border-gray-200 bg-white">
			<SidebarHeader className="p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-900 text-white">
							<Bolt className="h-5 w-5" />
						</div>
						<span className="text-xl font-semibold tracking-tight text-gray-900">
							KOSH
						</span>
					</div>
					<button
						onClick={toggleSidebar}
						className="transition-colors text-gray-400 hover:text-gray-600 lg:flex hidden"
					>
						<PanelLeft className="h-5 w-5" />
					</button>
				</div>

				<div className="mt-6 relative group">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
					<Input
						placeholder="Search"
						className="pl-9 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-gray-200 placeholder:text-gray-400"
					/>
				</div>
			</SidebarHeader>

			<SidebarContent className="px-4 custom-scrollbar">
				<SidebarGroup>
					<SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-gray-400 px-2">
						Menu
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										className="hover:bg-gray-50 group"
									>
										<a
											href={item.url}
											className="flex items-center gap-3 py-2.5"
										>
											<item.icon className="h-5 w-5 text-gray-500 group-hover:text-gray-900 group-hover:scale-105 transition-all" />
											<span className="text-base font-medium text-gray-500 group-hover:text-gray-900">
												{item.title}
											</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup className="mt-4">
					<SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider text-gray-400 px-2">
						Help & Support
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{supportItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										isActive={item.active}
										className={
											item.active
												? "bg-gray-50 text-gray-900"
												: "hover:bg-gray-50 text-gray-500"
										}
									>
										<a
											href={item.url}
											className="flex items-center gap-3 py-2.5"
										>
											<item.icon
												className={`h-5 w-5 ${item.active ? "text-gray-900" : "text-gray-500 group-hover:text-gray-900"}`}
											/>
											<span className="text-base font-medium">
												{item.title}
											</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="p-4 border-t border-gray-200">
				<button className="flex gap-3 transition-colors text-left w-full rounded-lg p-2 items-center hover:bg-gray-50">
					<Avatar className="h-10 w-10 border-2 border-white shadow-sm">
						<AvatarImage src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop" />
						<AvatarFallback>BT</AvatarFallback>
					</Avatar>
					<div className="flex-1 min-w-0">
						<p className="truncate text-sm font-semibold text-gray-900">
							Bibek Tamang
						</p>
						<p className="text-xs text-gray-500 truncate">
							info.madhu786@gmail.com
						</p>
					</div>
					<ChevronDown className="h-4 w-4 text-gray-400" />
				</button>
			</SidebarFooter>
		</Sidebar>
	);
};

export default DashboardSidebar;
