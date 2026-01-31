import { Edit } from "lucide-react";
import { Button } from "@kosh/ui/components/button";

interface Variant {
	id: string;
	sku: string;
	barcode: string;
	attributes: Record<string, string>;
	price: number;
	stock: number;
	lowStock?: boolean;
}

interface VariantRowProps {
	variant: Variant;
	onEdit?: (variantId: string) => void;
}

export function VariantRow({ variant, onEdit }: VariantRowProps) {
	const attributeEntries = Object.entries(variant.attributes);

	return (
		<tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
			<td className="px-6 py-3"></td>
			<td className="px-6 py-3">
				<div className="space-y-1">
					{attributeEntries.map(([key, value]) => (
						<div
							key={key}
							className="text-sm"
						>
							<span className="text-gray-500">{key}:</span>
							<span className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
								{value}
							</span>
						</div>
					))}
				</div>
			</td>
			<td className="px-6 py-3">
				<div className="text-sm text-gray-600">
					<div className="font-mono text-xs">{variant.sku}</div>
					<div className="text-xs text-gray-400 mt-1">{variant.barcode}</div>
				</div>
			</td>
			<td className="px-6 py-3">
				<span className="text-sm font-medium text-gray-900">
					${variant.price.toFixed(2)}
				</span>
			</td>
			<td className="px-6 py-3">
				<div className="flex items-center gap-1">
					{variant.lowStock && (
						<div className="w-2 h-2 rounded-full bg-orange-500"></div>
					)}
					<span
						className={`text-sm font-medium ${variant.lowStock ? "text-orange-600" : "text-gray-900"}`}
					>
						{variant.stock}
					</span>
				</div>
			</td>
			<td className="px-6 py-3 text-right">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onEdit?.(variant.id)}
					className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
				>
					<Edit className="w-4 h-4 mr-1" />
					Edit
				</Button>
			</td>
		</tr>
	);
}
