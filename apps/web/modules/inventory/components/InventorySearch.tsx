"use client";

import { Search, Download, ChevronDown, Plus, Check } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { ProductSheet } from "./ProductSheet";
import { AddCategoryModal } from "./AddCategoryModal";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@kosh/ui/components/tooltip";
import { Input } from "@kosh/ui/components/input";
import { useState, useMemo, memo, useCallback } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@kosh/ui/components/dropdown-menu";
import { cn } from "@/lib/utils";

import { Status } from "@/gql/graphql";
import { useCategoryList } from "../hooks/useProducts";

interface InventorySearchProps {
	onSearch?: (query: string) => void;
	onCategoryFilter?: (categoryId: string | null) => void;
	onStatusFilter?: (status: string | null) => void;
	onGenerateBarcodes?: () => void;
	selectedCount?: number;
	activeCategoryId?: string | null;
activeStatus?: string | null;
}

const InventorySearch = memo(
	({
		onSearch,
		onCategoryFilter,
		onStatusFilter,
		onGenerateBarcodes,
		selectedCount = 0,
		activeCategoryId,
		activeStatus,
	}: InventorySearchProps) => {
		const { data: rawData, loading } = useCategoryList();

		const categories = useMemo(
			() => rawData?.getCategories?.data ?? [],
			[rawData?.getCategories?.data],
		);

		const [categorySearch, setCategorySearch] = useState("");

		const filteredCategories = useMemo(() => {
			if (!categorySearch) return categories;
			return (
				categories?.filter((cat: any) =>
					cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
				) ?? []
			);
		}, [categories, categorySearch]);

		const selectedCategoryName = useMemo(() => {
			if (!activeCategoryId || categories?.length === 0) return "Category";
			const cat = categories?.find((c: any) => c.id === activeCategoryId);
			return cat ? cat.name : "Category";
		}, [activeCategoryId, categories]);

		// Stable reference for status options to prevent useMemo invalidation
		const statusOptions = useMemo(
			() => [
				{ label: "Active", value: Status.Active },
				{ label: "Inactive", value: Status.Inactive },
				{ label: "Out of Stock", value: Status.OutOfStock },
			],
			[],
		);

		const selectedStatusLabel = useMemo(() => {
			if (!activeStatus) return "Status";
			const opt = statusOptions.find((o) => o.value === activeStatus);
			return opt ? opt.label : "Status";
		}, [activeStatus, statusOptions]);

		const handleSearchChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				onSearch?.(e.target.value);
			},
			[onSearch],
		);

		const handleCategorySearchChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				setCategorySearch(e.target.value);
			},
			[],
		);

		const handleCategorySelect = useCallback(
			(catId: string | null) => {
				onCategoryFilter?.(catId);
			},
			[onCategoryFilter],
		);

		const handleStatusSelect = useCallback(
			(status: string | null) => {
				onStatusFilter?.(status);
			},
			[onStatusFilter],
		);

		const handleGenerateBarcodes = useCallback(() => {
			onGenerateBarcodes?.();
		}, [onGenerateBarcodes]);

		return (
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-3">
					<div className="flex-1 relative group">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
						<Input
							id="inventory-search"
							type="text"
							placeholder="Search product name, SKU..."
							onChange={handleSearchChange}
							className="w-full pl-10 pr-4 py-2 h-10 border-border focus-visible:ring-primary/20"
						/>
					</div>

					<ProductSheet
						product={null}
						trigger={
							<Button className="text-sm flex items-center gap-2 h-10 px-4 hover:cursor-pointer">
								<Plus className="w-4 h-4" />
								<span className="text-white">Add Product</span>
							</Button>
						}
					/>
					<AddCategoryModal />

					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className={cn(
									"text-sm flex items-center gap-2 h-10 px-4 bg-transparent border-border hover:bg-muted/50",
									activeCategoryId && "border-primary text-primary bg-primary/5",
								)}
							>
								<span className="max-w-25 truncate">
									{selectedCategoryName}
								</span>
								<ChevronDown className="w-4 h-4 opacity-50" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-50"
						>
							<div className="p-2">
								<Input
									placeholder="Search categories..."
									value={categorySearch}
									onChange={handleCategorySearchChange}
									className="h-8 text-xs"
									autoFocus
								/>
							</div>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => handleCategorySelect(null)}
								className="flex items-center justify-between"
							>
								All Categories
								{!activeCategoryId && <Check className="w-4 h-4" />}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<div className="max-h-50 overflow-auto">
								{filteredCategories.map((cat) => (
									<DropdownMenuItem
										key={cat.id}
										onClick={() => handleCategorySelect(cat.id)}
										className="flex items-center justify-between"
									>
										{cat.name}
										{activeCategoryId === cat.id && <Check className="w-4 h-4" />}
									</DropdownMenuItem>
								))}
								{filteredCategories.length === 0 && (
									<div className="p-2 text-xs text-muted-foreground text-center">
										No categories found
									</div>
								)}
							</div>
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className={cn(
									"text-sm flex items-center gap-2 h-10 px-4 bg-transparent border-border hover:bg-muted/50",
									activeStatus && "border-primary text-primary bg-primary/5",
								)}
							>
								{selectedStatusLabel}
								<ChevronDown className="w-4 h-4 opacity-50" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-40"
						>
							<DropdownMenuItem
								onClick={() => handleStatusSelect(null)}
								className="flex items-center justify-between"
							>
								All Status
								{!activeStatus && <Check className="w-4 h-4" />}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							{statusOptions.map((opt) => (
								<DropdownMenuItem
									key={opt.value}
									onClick={() => handleStatusSelect(opt.value)}
									className="flex items-center justify-between"
								>
									{opt.label}
									{activeStatus === opt.value && <Check className="w-4 h-4" />}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						variant="outline"
						size="sm"
						onClick={handleGenerateBarcodes}
						disabled={selectedCount === 0}
						className={cn(
							"text-sm flex items-center gap-2 h-10 px-4 bg-transparent border-border",
							selectedCount > 0 && "border-success text-success bg-success/5",
						)}
					>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-2 justify-center">
									<Download className="w-4 h-4" />
									<span>
										Barcodes {selectedCount > 0 && `(${selectedCount})`}
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent className="bg-popover text-popover-foreground border-border shadow-md">
								{selectedCount > 0
									? `Generate barcodes for ${selectedCount} products`
									: "Select products to generate barcodes"}
							</TooltipContent>
						</Tooltip>
					</Button>
				</div>
			</div>
		);
	},
);

InventorySearch.displayName = "InventorySearch";

export default InventorySearch;
