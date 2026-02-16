import { createZodDto } from 'nestjs-zod';
import { createPurchaseSchema, payPurchaseDebtSchema } from '@kosh/validation';

export class CreatePurchaseDto extends createZodDto(createPurchaseSchema) {}

export class PayPurchaseDebtDto extends createZodDto(payPurchaseDebtSchema) {}