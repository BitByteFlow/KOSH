"use client";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@kosh/ui/components/sheet";
import { Badge } from "@kosh/ui/components/badge";
import { Package, Tag, Wallet, Barcode } from "lucide-react";
import { Product, ProductVariant } from "@/gql/graphql";

interface ProductDetailsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product: Product | null;
}

export function ProductDetailsSheet({
	open,
	onOpenChange,
	product,
}: ProductDetailsSheetProps) {
	if (!product) return null;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-[600px] p-0 flex flex-col h-full bg-white">
				<SheetHeader className="px-6 py-6 border-b border-gray-100 flex-shrink-0">
					<div className="flex items-start justify-between pr-8">
						<div>
							<SheetTitle className="text-xl font-bold tracking-tight text-gray-900">
								{product.productName}
							</SheetTitle>
							<SheetDescription className="mt-1.5 text-sm text-gray-500 flex items-center gap-2">
								<Badge variant="secondary" className="font-normal text-xs px-2 py-0.5 h-auto bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">
									{product.category.name}
								</Badge>
								<span className="text-gray-300">•</span>
								<span className={product.totalStock > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
									{product.totalStock > 0 ? `${product.totalStock} in stock` : "Out of stock"}
								</span>
							</SheetDescription>
						</div>
						<Badge
							variant={product.status === 'active' ? 'default' : 'secondary'}
							className={`capitalize ${product.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100 shadow-none' : ''}`}
						>
							{product.status}
						</Badge>
					</div>
				</SheetHeader>

				<div className="flex-1 overflow-y-auto px-6">
					<div className="py-8 space-y-8">
						{/* General Stats Grid */}
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex items-start gap-4 transition-colors hover:bg-gray-50 hover:border-gray-200">
								<div className="p-2.5 bg-white rounded-lg border border-gray-100 shadow-sm text-blue-600">
									<Package className="w-5 h-5" />
								</div>
								<div>
									<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Stock</p>
									<p className="mt-1 text-lg font-semibold text-gray-900">{product.totalStock}</p>
								</div>
							</div>
							<div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex items-start gap-4 transition-colors hover:bg-gray-50 hover:border-gray-200">
								<div className="p-2.5 bg-white rounded-lg border border-gray-100 shadow-sm text-purple-600">
									<Wallet className="w-5 h-5" />
								</div>
								<div>
									<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</p>
									<p className="mt-1 text-lg font-semibold text-gray-900 capitalize">{product.category.name}</p>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between pb-2 border-b border-gray-100">
								<h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
									Variants
									<span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
										{product.variantCount}
									</span>
								</h3>
							</div>

							<div className="space-y-3">
								{product.variants?.map((variant: ProductVariant) => (
									<div
										key={variant.id}
										className="group bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-gray-300"
									>
										<div className="flex items-start justify-between">
											<div className="space-y-3">
												<div className="flex flex-wrap gap-2">
													{variant.attributes?.map((attribute: any) => (
														<div key={attribute.name} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700">
															<span className="text-gray-400 capitalize">{attribute.name}:</span>
															<span className="text-gray-900 font-semibold">{attribute.value}</span>
														</div>
													))}
												</div>

												<div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
													<Barcode className="w-3.5 h-3.5" />
													<span>{variant.sku}</span>
												</div>
											</div>
											<div className="text-right space-y-1">
												<div className="text-sm font-semibold text-gray-900">
													Rs. {variant.price?.toFixed(2)}
												</div>
												<div className="text-xs font-medium text-gray-500">
													Stock: <span className={variant.stock < 10 ? "text-amber-600" : "text-gray-700"}>{variant.stock}</span>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
