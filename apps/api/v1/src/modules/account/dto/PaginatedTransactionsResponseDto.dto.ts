import type { TransactionResponseDto } from "./TransactionResponseDto.dto";

export class PaginationMetaDto {
	total!: number;
	page!: number;
	limit!: number;
	totalPages!: number;
	hasNext!: boolean;
	hasPrev!: boolean;
	constructor(partial: Partial<PaginationMetaDto>) {
		Object.assign(this, partial);
	}
}

export class PaginatedTransactionsResponseDto {
	data!: TransactionResponseDto[];
	meta!: PaginationMetaDto;
}
