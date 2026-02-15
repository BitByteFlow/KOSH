import { createZodDto } from 'nestjs-zod';
import { loginRequestSchema } from '@kosh/validation';

export class LoginRequestDto extends createZodDto(loginRequestSchema) {}