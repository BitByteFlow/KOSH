import type { Request } from "express";
import type { UserResponseInput } from "src/modules/user/dto/UserResponseDto";

export interface AuthenticatedRequest extends Request {
	user: UserResponseInput;
	storeId: string;
}
