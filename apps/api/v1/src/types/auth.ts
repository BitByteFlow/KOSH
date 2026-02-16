import type { Request } from "express";
import type { UserResponseDto } from "src/modules/user/dto/UserResponseDto";

export  interface AuthenticatedRequest extends Request {
	user: UserResponseDto;
}
