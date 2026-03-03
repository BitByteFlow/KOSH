import { Button } from "@kosh/ui/components/button";
import { Checkbox } from "@kosh/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@kosh/ui/components/dialog";
import { Input } from "@kosh/ui/components/input";
import { Label } from "@kosh/ui/components/label";
import { SlidersHorizontal, X } from "lucide-react";
import React, { useEffect, useState } from "react";

export interface SalesFilters {
	minTotal: string;
	maxTotal: string;
	minProfit: string;
	maxProfit: string;
	minItems: string;
	maxItems: string;
	paymentTypes: string[];
}

interface SalesFilterProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	initialFilters: SalesFilters;
	onApply: (filters: SalesFilters) => void;
}

const SalesFilter = ({
	isOpen,
	onOpenChange,
	initialFilters,
	onApply,
}: SalesFilterProps) => {
	const [localFilters, setLocalFilters] = useState<SalesFilters>(initialFilters);
	useEffect(() => {
		if (isOpen) {
			setLocalFilters(initialFilters);
		}
	}, [isOpen, initialFilters]);

	const handlePaymentTypeChange = (type: string, checked: boolean) => {
		setLocalFilters((prev) => ({
			...prev,
			paymentTypes: checked
				? [...prev.paymentTypes, type]
				: prev.paymentTypes.filter((t) => t !== type),
		}));
	};

	const resetFilters = () => {
		setLocalFilters({
			minTotal: "",
			maxTotal: "",
			minProfit: "",
			maxProfit: "",
			minItems: "",
			maxItems: "",
			paymentTypes: [],
		});
	};

	const handleApply = () => {
		onApply(localFilters);
		onOpenChange(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<SlidersHorizontal className="h-5 w-5" />
						Filter Sales
					</DialogTitle>
					<DialogDescription>
						Refine your sales history by applying filters below.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-6 py-4">
					<div className="space-y-3">
						<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Total Amount (Rs)
						</Label>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<Label className="text-[10px] text-muted-foreground">Min</Label>
								<Input
									type="number"
									placeholder="0"
									className="h-9"
									value={localFilters.minTotal}
									onChange={(e) =>
										setLocalFilters((prev) => ({
											...prev,
											minTotal: e.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-1">
								<Label className="text-[10px] text-muted-foreground">Max</Label>
								<Input
									type="number"
									placeholder="Max"
									className="h-9"
									value={localFilters.maxTotal}
									onChange={(e) =>
										setLocalFilters((prev) => ({
											...prev,
											maxTotal: e.target.value,
										}))
									}
								/>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Profit (Rs)
						</Label>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<Label className="text-[10px] text-muted-foreground">Min</Label>
								<Input
									type="number"
									placeholder="0"
									className="h-9"
									value={localFilters.minProfit}
									onChange={(e) =>
										setLocalFilters((prev) => ({
											...prev,
											minProfit: e.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-1">
								<Label className="text-[10px] text-muted-foreground">Max</Label>
								<Input
									type="number"
									placeholder="Max"
									className="h-9"
									value={localFilters.maxProfit}
									onChange={(e) =>
										setLocalFilters((prev) => ({
											...prev,
											maxProfit: e.target.value,
										}))
									}
								/>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Number of Items
						</Label>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<Label className="text-[10px] text-muted-foreground">Min</Label>
								<Input
									type="number"
									placeholder="0"
									className="h-9"
									value={localFilters.minItems}
									onChange={(e) =>
										setLocalFilters((prev) => ({
											...prev,
											minItems: e.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-1">
								<Label className="text-[10px] text-muted-foreground">Max</Label>
								<Input
									type="number"
									placeholder="Max"
									className="h-9"
									value={localFilters.maxItems}
									onChange={(e) =>
										setLocalFilters((prev) => ({
											...prev,
											maxItems: e.target.value,
										}))
									}
								/>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Payment Type
						</Label>
						<div className="flex flex-wrap gap-x-6 gap-y-2">
							{["CASH", "ONLINE", "CREDIT"].map((type) => (
								<div key={type} className="flex items-center space-x-2">
									<Checkbox
										id={`filter-payment-${type}`}
										checked={localFilters.paymentTypes.includes(type)}
										onCheckedChange={(checked) =>
											handlePaymentTypeChange(type, checked as boolean)
										}
									/>
									<Label
										htmlFor={`filter-payment-${type}`}
										className="text-sm font-medium cursor-pointer"
									>
										{type === "CREDIT"
											? "Credit"
											: type.charAt(0) + type.slice(1).toLowerCase()}
									</Label>
								</div>
							))}
						</div>
					</div>
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="ghost"
						className="text-muted-foreground hover:text-foreground"
						onClick={resetFilters}
					>
						<X className="mr-2 h-4 w-4" />
						Reset Filters
					</Button>
					<Button
						onClick={handleApply}
						className="bg-primary hover:bg-primary/90 text-primary-foreground"
					>
						Apply Filters
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default SalesFilter;