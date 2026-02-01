
export interface VariantAttribute {
	name: string;
	value: string;
}

export interface Variant {
	id: string;
	costPrice: string;
	sellingPrice: string;
	stock: string;
	attributes: VariantAttribute[];
}