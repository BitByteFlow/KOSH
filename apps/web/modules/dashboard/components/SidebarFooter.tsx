import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@kosh/ui/components/avatar";
import { ChevronDown } from "lucide-react";
import { SidebarFooter } from "@kosh/ui/components/sidebar";
import { auth } from "@/app/api/auth/[...nextauth]/auth";

const SidebarFooterComponent = async () => {
	const session = await auth()

	return (
		<SidebarFooter className="p-4 border-t border-gray-200">
			<button className="flex gap-3 transition-colors text-left w-full rounded-lg p-2 items-center hover:bg-gray-50">
				<Avatar className="h-10 w-10 border-2 border-white shadow-sm">
					<AvatarImage src={session?.user?.image || ""} />
					<AvatarFallback>{session?.user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
				</Avatar>
				<div className="flex-1 min-w-0">
					<p className="truncate text-sm font-semibold text-gray-900">
						{session?.user?.name}
					</p>
					<p className="text-xs text-gray-500 truncate">
						{session?.user?.email}
					</p>
				</div>
				<ChevronDown className="h-4 w-4 text-gray-400" />
			</button>
		</SidebarFooter>
	);
};

export default SidebarFooterComponent;