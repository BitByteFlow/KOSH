import React from "react";
import { Badge } from "@kosh/ui/components/badge";

interface ProductCatalogHeaderProps {
	variantCount?: number;
}

export const ProductCatalogHeader: React.FC<ProductCatalogHeaderProps> =
	React.memo(({ variantCount }) => {
		return (
			<div className="flex items-center justify-between mb-4 px-1">
				<h2 className="font-bold text-slate-800 uppercase tracking-tighter text-lg">
					Product Catalog
				</h2>
				<div className="h-px flex-1 mx-4 bg-slate-200" aria-hidden="true" />
				<Badge
					variant="outline"
					className="border-slate-200 text-slate-400 font-bold uppercase text-[9px]"
					aria-label={`${variantCount || 0} products available`}
				>
					Select to Configure
				</Badge>
			</div>
		);
	});

ProductCatalogHeader.displayName = "ProductCatalogHeader";

export default ProductCatalogHeader;
