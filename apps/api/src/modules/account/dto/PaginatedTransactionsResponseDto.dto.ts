import type { TransactionResponseDto } from "./TransactionResponseDto.dto";

export class PaginationMetaDto {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export class PaginatedTransactionsResponseDto {
	data: TransactionResponseDto[];
	meta: PaginationMetaDto;
}
