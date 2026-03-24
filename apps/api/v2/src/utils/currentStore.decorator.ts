import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export const CurrentStore = createParamDecorator(
	(data: unknown, context: ExecutionContext): string => {
		const ctx = GqlExecutionContext.create(context);
		const req = ctx.getContext().req;

		// Assumes StoreGuard has run and successfully populated req.storeId
		return req.storeId;
	},
);

export const CurrentStoreMember = createParamDecorator(
	(data: unknown, context: ExecutionContext): any => {
		const ctx = GqlExecutionContext.create(context);
		const req = ctx.getContext().req;

		return req.storeMember;
	},
);
