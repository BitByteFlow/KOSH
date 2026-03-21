"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { Building2, ChevronDown, Loader2, Store } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@kosh/ui/components/dropdown-menu";

export function StoreSwitcher() {
	const { stores, activeStoreId, switchStore, isLoading } = useStore();

	if (isLoading && stores.length === 0) {
		return (
			<div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground animate-pulse">
				<Loader2 className="h-4 w-4 animate-spin" />
				<span>Loading stores...</span>
			</div>
		);
	}

	if (stores.length === 0) {
		return (
			<div className="flex items-center gap-2 px-3 py-2 text-sm text-destructive">
				<Building2 className="h-4 w-4" />
				<span>No stores found</span>
			</div>
		);
	}

	return (
		<div className="w-full">
			<DropdownMenu>
				<DropdownMenuTrigger className="hover:cursor-pointer w-full h-9 border-gray-300 border-2 shadow-inner  rounded-lg hover:bg-accent transition-colors focus:ring-0 px-3 ">
					<div className="flex items-center gap-2 truncate text-foreground/80">
						<div className="flex items-center justify-center text-primary shrink-0 gap-4">
							<Store className="h-4 w-4 text-green-600" />
							<span className="font-semibold text-gray-600 tracking-tighter">
								In store
							</span>
						</div>
						<ChevronDown className="h-4 w-4" />
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="rounded-sm border-none shadow-2xl p-1 mt-1">
					{stores.map((store) => (
						<DropdownMenuItem
							key={store.id}
							className="rounded-sm py-2.5 focus:bg-primary/10 focus:text-primary transition-colors hover:cursor-pointer border-b border-2 border-border"
						>
							<div className="flex flex-col gap-0.5 ">
								<span className="font-semibold text-sm">{store.name}</span>
								<span className="text-xs text-muted-foreground uppercase font-bold tracking-tight">
									ID: {store.id.slice(0, 8)}...
								</span>
							</div>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
