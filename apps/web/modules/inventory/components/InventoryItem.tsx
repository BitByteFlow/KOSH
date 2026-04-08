"use client";

import { useState, useCallback, memo, startTransition } from "react";
import { ChevronDown, MoreVertical } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { Checkbox } from "@kosh/ui/components/checkbox";
import { StatusBadge } from "./StatusBadge";
import { VariantRow } from "./VariantRow";
import { EditVariantSheet } from "./EditVariantSheet";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@kosh/ui/components/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@kosh/ui/components/dialog";
import { Edit, Trash, Copy, FolderInput, Eye } from "lucide-react";

import {
	TableRow,
	TableCell,
	Table,
	TableHeader,
	TableHead,
	TableBody,
} from "@kosh/ui/components/table";
import { Status, ProductVariant, Category } from "@/gql/graphql";

interface InventoryItemProps {
	id: string;
	productName: string;
	category: Category;
	totalStock: number;
	variantCount: number;
	status: Status;
	variants: any[];
	onEdit?: (productId: string) => void;
	onEditVariant?: (variantId: string) => void;
	onUpdateVariant?: (variant: any) => Promise<void>;
	onViewDetails?: (productId: string) => void;
	onDelete?: (productId: string) => void;
	onChangeCategory?: (productId: string) => void;
	isSelected?: boolean;
	onToggleSelection?: (productId: string) => void;
}

const InventoryItem = memo(
	({
		id,
		productName,
		category,
		totalStock,
		variantCount,
		status,
		variants,
		onEdit,
		onEditVariant,
		onUpdateVariant,
		onViewDetails,
		onDelete,
		onChangeCategory,
		isSelected = false,
		onToggleSelection,
	}: InventoryItemProps) => {
		const [isExpanded, setIsExpanded] = useState(false);
		const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
			null,
		);
		const [isSheetOpen, setIsSheetOpen] = useState(false);
		const [showDeleteDialog, setShowDeleteDialog] = useState(false);

		const handleToggleExpand = useCallback(() => {
			setIsExpanded((prev) => !prev);
		}, []);

		const handleEditVariant = useCallback(
			(variantId: string) => {
				const variant = variants.find((v) => v.id === variantId);
				if (variant) {
					setEditingVariant(variant);
					setIsSheetOpen(true);
				}
			},
			[variants],
		);

		const handleSaveVariant = useCallback(
			async (updatedVariant: any) => {
				console.log("Saving variant:", updatedVariant);

				await onUpdateVariant?.(updatedVariant);
				await new Promise((resolve) => setTimeout(resolve, 500));
				setIsSheetOpen(false);
				setEditingVariant(null);
			},
			[onUpdateVariant],
		);

		const handleDelete = useCallback(async () => {
			await onDelete?.(id);
			setShowDeleteDialog(false);
		}, [onDelete, id]);

		const handleToggleSelection = useCallback(() => {
			// Use startTransition to mark this as non-urgent
			startTransition(() => {
				onToggleSelection?.(id);
			});
		}, [onToggleSelection, id]);

		const handleEdit = useCallback(() => {
			onEdit?.(id);
		}, [onEdit, id]);

		const handleViewDetails = useCallback(() => {
			onViewDetails?.(id);
		}, [onViewDetails, id]);

		const handleChangeCategory = useCallback(() => {
			onChangeCategory?.(id);
		}, [onChangeCategory, id]);

		const handleEditVariantDirect = useCallback(() => {
			onEditVariant?.(variants[0]?.id);
		}, [onEditVariant, variants]);

		const statusConfig = {
			[Status.Active]: "Active",
			[Status.Inactive]: "Inactive",
			[Status.OutOfStock]: "Out of Stock",
		}[status];

		return (
			<>
				<TableRow className="hover:bg-muted/30 transition-colors border-b border-border/50 [&_td:first-child]:pl-6 [&_td:last-child]:pr-6 [&_td]:py-5">
					<TableCell className="w-12">
						<Checkbox
							checked={isSelected}
							onCheckedChange={handleToggleSelection}
						/>
					</TableCell>

					<TableCell>
						<button
							type="button"
							onClick={handleToggleExpand}
							className="flex items-center gap-3 text-left w-full group"
						>
							<ChevronDown
								className={`w-4 h-4 transition-transform text-muted-foreground group-hover:text-foreground ${
									isExpanded ? "rotate-180" : ""
								}`}
							/>
							<div>
								<p className="font-semibold text-foreground">{productName}</p>
								<p className="text-xs text-muted-foreground font-medium">
									{variantCount} {variantCount === 1 ? "Variant" : "Variants"}
								</p>
							</div>
						</button>
					</TableCell>

					<TableCell className="text-sm font-medium text-muted-foreground">
						{category.name}
					</TableCell>

					<TableCell className="font-bold tabular-nums">{totalStock}</TableCell>

					<TableCell>
						<StatusBadge status={status}>{statusConfig}</StatusBadge>
					</TableCell>

					<TableCell className="text-right">
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="w-8 h-8"
								>
									<MoreVertical className="w-4 h-4 text-muted-foreground" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuItem onClick={handleEdit}>
									<Edit className="mr-2 h-4 w-4" />
									Edit Product
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleViewDetails}>
									<Eye className="mr-2 h-4 w-4" />
									View Details
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleChangeCategory}>
									<FolderInput className="mr-2 h-4 w-4" />
									Change Category
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-red-600 focus:text-red-600 focus:bg-red-50"
									onClick={() => setShowDeleteDialog(true)}
								>
									<Trash className="mr-2 h-4 w-4" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</TableCell>
				</TableRow>

				{isExpanded && (
					<TableRow className="bg-primary-foreground border-none hover:bg-transparent">
						<TableCell
							colSpan={6}
							className="p-0"
						>
							<div className="p-4 bg-muted/20">
								<Table>
									<TableHeader>
										<TableRow className="border-border">
											<TableHead className="w-12 pl-6" />
											<TableHead>Attributes</TableHead>
											<TableHead>SKU / Barcode</TableHead>
											<TableHead>Price</TableHead>
											<TableHead>Stock</TableHead>
											<TableHead className="text-right pr-6">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{variants.map((variant) => (
											<VariantRow
												key={variant.id}
												variant={variant}
												onEdit={handleEditVariant}
											/>
										))}
									</TableBody>
								</Table>
							</div>
						</TableCell>
					</TableRow>
				)}

				<EditVariantSheet
					open={isSheetOpen}
					onOpenChange={setIsSheetOpen}
					variant={editingVariant || undefined}
					onSave={handleSaveVariant}
				/>

				<Dialog
					open={showDeleteDialog}
					onOpenChange={setShowDeleteDialog}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Product?</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete <strong>{productName}</strong>?
								This action cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowDeleteDialog(false)}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleDelete}
							>
								Delete Product
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</>
		);
	},
);

InventoryItem.displayName = "InventoryItem";

export default InventoryItem;
