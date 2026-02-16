import { createZodDto } from 'nestjs-zod';
import { variantDtoSchema } from '@kosh/validation';
import { InputType } from '@nestjs/graphql';

@InputType()
export class VariantInput extends createZodDto(variantDtoSchema) {}
