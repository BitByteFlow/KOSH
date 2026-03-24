import React, { useState, useEffect, useCallback } from "react";
import { useProductSearch } from "../hooks/useProducts";
import type { Product } from "../types";
import { Search, Package, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@kosh/ui/components/input";
import { Card, CardContent } from "@kosh/ui/components/card";
import { Badge } from "@kosh/ui/components/badge";

interface ProductSearchProps {
	onProductSelect: (product: Product) => void;
	externalSearch?: string;
}

const ProductSearch: React.FC<ProductSearchProps> = ({
	onProductSelect,
	externalSearch,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		if (externalSearch) {
			setSearchTerm(externalSearch);
			setDebouncedSearch(externalSearch);
		}
	}, [externalSearch]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchTerm.length >= 2) {
				setDebouncedSearch(searchTerm);
			} else {
				setDebouncedSearch("");
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const {
		data,
		isLoading: loading,
		error,
	} = useProductSearch(
		{ search: debouncedSearch || undefined, page: 1, limit: 20 },
		!!debouncedSearch,
	);

	const results = data?.data || [];

	const handleSearch = useCallback((term: string) => {
		setSearchTerm(term);
	}, []);

	return (
		<div className="flex flex-col gap-6">
			<div className="relative">
				<Search
					className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
					size={18}
				/>
				<Input
					placeholder="Search products by name or SKU..."
					className="pl-11 h-12 text-base rounded-xl border-slate-200"
					value={searchTerm}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						setSearchTerm(e.target.value);
						handleSearch(e.target.value);
					}}
				/>
				{loading && (
					<div className="absolute right-4 top-1/2 -translate-y-1/2">
						<Loader2
							className="animate-spin text-primary"
							size={18}
						/>
					</div>
				)}
			</div>

			<div className="grid grid-cols-2 gap-3">
				<AnimatePresence mode="popLayout">
					{results.map((product: any) => (
						<motion.div
							key={product.id}
							layout
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
						>
							<Card
								className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group border-slate-200 bg-white h-full"
								onClick={() => onProductSelect(product)}
							>
								<CardContent className="p-4 flex flex-col h-full">
									<div className="flex-1">
										<div className="flex items-start justify-between gap-2 mb-2">
											<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
												<Package
													size={18}
													className="text-primary"
												/>
											</div>
											{product.variantCount > 1 && (
												<Badge
													variant="secondary"
													className="text-sm h-5 px-2 bg-slate-100 text-slate-500 border-none"
												>
													{product.variantCount} variants
												</Badge>
											)}
										</div>
										<h4 className="font-bold text-slate-800 line-clamp-2 leading-tight">
											{product.productName}
										</h4>
										<p className="text-sm text-slate-400 font-bold uppercase tracking-wider mt-1">
											{product.category?.name || "Uncategorized"}
										</p>
									</div>

									<div className="mt-3 pt-3 border-t border-slate-100">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-xs text-slate-400 font-medium">
													Price
												</p>
												<p className="text-base font-black text-slate-900">
													Rs. 
													{Math.min(
														...product.variants.map((v: any) => v.sellingPrice),
													).toFixed(2)}
												</p>
											</div>
											<div className="text-right">
												<p className="text-xs text-slate-400 font-medium">
													Stock
												</p>
												<p
													className={`text-sm font-bold ${product.totalStock > 0 ? "text-green-600" : "text-red-500"}`}
												>
													{product.totalStock} units
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</AnimatePresence>

				{!loading && searchTerm.length >= 2 && results.length === 0 && (
					<div className="col-span-2 text-center py-12 text-slate-400">
						<Package
							size={48}
							className="mx-auto mb-3 opacity-50"
						/>
						<p className="font-medium">No products found for "{searchTerm}"</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProductSearch;
