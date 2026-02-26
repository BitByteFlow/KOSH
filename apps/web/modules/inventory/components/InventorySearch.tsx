"use client";

import { Search, Download, ChevronDown, Plus, Check } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { ProductSheet } from "./ProductSheet";
import { AddCategoryModal } from "./AddCategoryModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@kosh/ui/components/tooltip";
import { Input } from "@kosh/ui/components/input";
import { useState, useMemo } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@kosh/ui/components/dropdown-menu";
import { cn } from "@/lib/utils";

import { Status } from "@/gql/graphql";
import { gql } from "@/gql";
import { useQuery } from "@apollo/client/react";
import { parseGraphQLListResponse } from "@/lib/graphql/utils";

interface InventorySearchProps {
	onSearch?: (query: string) => void;
	onCategoryFilter?: (categoryId: string | null) => void;
	onStatusFilter?: (status: string | null) => void;
	onGenerateBarcodes?: () => void;
	selectedCount?: number;
	activeCategoryId?: string | null;
	activeStatus?: string | null;
}

const GET_CATEGORIES = gql(`
	query GetCategoriesForSearch {
		getCategories {
			success
			message
			data {
				id
				name
				createdAt
				updatedAt
			}
		}
	}
`)

const InventorySearch = ({
	onSearch,
	onCategoryFilter,
	onStatusFilter,
	onGenerateBarcodes,
	selectedCount = 0,
	activeCategoryId,
	activeStatus,
}: InventorySearchProps) => {
	const { data: rawData } = useQuery(GET_CATEGORIES)

	const categories = useMemo(() =>
		parseGraphQLListResponse(rawData?.getCategories),
		[rawData?.getCategories]
	);

	const [categorySearch, setCategorySearch] = useState("");

	const filteredCategories = useMemo(() => {
		if (!categorySearch) return categories.data ?? [];
		return categories.data?.filter((cat) =>
			cat.name.toLowerCase().includes(categorySearch.toLowerCase())
		) ?? [];
	}, [categories, categorySearch]);

	const selectedCategoryName = useMemo(() => {
		if (!activeCategoryId || categories.data?.length === 0) return "Category";
		const cat = categories.data?.find((c) => c.id === activeCategoryId);
		return cat ? cat.name : "Category";
	}, [activeCategoryId, categories]);

	const statusOptions = [
		{ label: "Active", value: Status.Active },
		{ label: "Inactive", value: Status.Inactive },
		{ label: "Out of Stock", value: Status.OutOfStock },
	];

	const selectedStatusLabel = useMemo(() => {
		if (!activeStatus) return "Status";
		const opt = statusOptions.find((o) => o.value === activeStatus);
		return opt ? opt.label : "Status";
	}, [activeStatus, statusOptions]);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-3">
				<div className="flex-1 relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
					<Input
						id="inventory-search"
						type="text"
						placeholder="Search by name, SKU, or category..."
						onChange={(e) => onSearch?.(e.target.value)}
						className="w-full pl-10 pr-4 py-2 h-10"
					/>
				</div>

				<ProductSheet
					product={null}
					trigger={
						<Button className="flex items-center gap-2 h-10 px-4">
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
								"flex items-center gap-2 h-10 px-4 bg-transparent",
								activeCategoryId && "border-blue-500 text-blue-600 bg-blue-50/50"
							)}
						>
							<span className="max-w-[100px] truncate">{selectedCategoryName}</span>
							<ChevronDown className="w-4 h-4 opacity-50" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-[200px]">
						<div className="p-2">
							<Input
								placeholder="Search categories..."
								value={categorySearch}
								onChange={(e) => setCategorySearch(e.target.value)}
								className="h-8 text-xs"
								autoFocus
							/>
						</div>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => onCategoryFilter?.(null)}
							className="flex items-center justify-between"
						>
							All Categories
							{!activeCategoryId && <Check className="w-4 h-4" />}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<div className="max-h-[200px] overflow-auto">
							{filteredCategories.map((cat) => (
								<DropdownMenuItem
									key={cat.id}
									onClick={() => onCategoryFilter?.(cat.id)}
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
								"flex items-center gap-2 h-10 px-4 bg-transparent",
								activeStatus && "border-blue-500 text-blue-600 bg-blue-50/50"
							)}
						>
							{selectedStatusLabel}
							<ChevronDown className="w-4 h-4 opacity-50" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-[160px]">
						<DropdownMenuItem
							onClick={() => onStatusFilter?.(null)}
							className="flex items-center justify-between"
						>
							All Status
							{!activeStatus && <Check className="w-4 h-4" />}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						{statusOptions.map((opt) => (
							<DropdownMenuItem
								key={opt.value}
								onClick={() => onStatusFilter?.(opt.value)}
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
					onClick={onGenerateBarcodes}
					disabled={selectedCount === 0}
					className={cn(
						"flex items-center gap-2 h-10 px-4 bg-transparent",
						selectedCount > 0 && "border-green-500 text-green-600 bg-green-50/50"
					)}
				>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center gap-2 justify-center">
								<Download className="w-4 h-4" />
								<span>Barcodes {selectedCount > 0 && `(${selectedCount})`}</span>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							{selectedCount > 0
								? `Generate barcodes for ${selectedCount} products`
								: "Select products to generate barcodes"}
						</TooltipContent>
					</Tooltip>
				</Button>
			</div>
		</div>
	);
}

export default InventorySearch;