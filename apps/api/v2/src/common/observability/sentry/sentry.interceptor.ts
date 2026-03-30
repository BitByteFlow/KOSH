import {
	Injectable,
	ExecutionContext,
	CallHandler,
	NestInterceptor,
	Optional,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import * as Sentry from "@sentry/nestjs";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { SentryService } from "./sentry.service";

@Injectable()
export class SentryGraphQLInterceptor implements NestInterceptor {
	constructor(@Optional() private readonly sentryService?: SentryService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const gqlCtx = GqlExecutionContext.create(context);
		const info = gqlCtx.getInfo();
		const request = gqlCtx.getContext().req;

		const operationName = info.operation?.name?.value || "anonymous";
		const operationType = info.operation?.operation || "query";
		const span = Sentry.startInactiveSpan({
			name: `${operationType}.${operationName}`,
			op: "graphql.execute",
			attributes: {
				"graphql.operation_name": operationName,
				"graphql.operation_type": operationType,
				"graphql.field_name": info.fieldName,
				"graphql.parent_type": info.parentType?.name || "",
			},
		});

		const startTimestamp = Date.now();

		if (request?.user) {
			Sentry.setUser({
				id: request.user.id,
				email: request.user.email,
				username: request.user.username,
			});
		}

		return next.handle().pipe(
			finalize(() => {
				const duration = Date.now() - startTimestamp;

				span.setAttribute("duration_ms", duration);
				span.setAttribute("graphql.success", true);

				span.end();
			}),
		);
	}
}
