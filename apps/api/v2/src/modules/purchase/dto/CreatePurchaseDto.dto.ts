import { createZodDto } from 'nestjs-zod';
import { createPurchaseSchema, payPurchaseDebtSchema } from '@kosh/validation';

export class CreatePurchaseInput extends createZodDto(createPurchaseSchema) {}

export class PayPurchaseDebtInput extends createZodDto(payPurchaseDebtSchema) {}