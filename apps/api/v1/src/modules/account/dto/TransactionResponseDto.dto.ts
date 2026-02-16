export class TransactionResponseDto {
	id!: string;
	type!: string;
	amount!: string;
	note!: string | null;
	createdAt!: Date;
	updatedAt!: Date;
}
