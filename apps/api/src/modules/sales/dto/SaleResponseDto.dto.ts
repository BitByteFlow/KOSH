export class SaleItemResponseDto {
	id: string;
	quantity: number;
	sellPrice: string;
	costPrice: string;
	variantId: string;
}

export class SaleResponseDto {
	id: string;
	total: string;
	discount: string;
	profit: string;
	paymentType: string;
	creditId: string | null;
	items: SaleItemResponseDto[];
	createdAt: Date;
	updatedAt: Date;
}
