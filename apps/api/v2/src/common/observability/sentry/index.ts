export { SentryModule } from "./sentry.module";
export { SentryService } from "./sentry.service";
export { SentryExceptionFilter } from "./sentry.filter";
export { SentryGraphQLInterceptor } from "./sentry.interceptor";

export {
	ApplicationError,
	ValidationError,
	RequiredFieldError,
	InvalidFormatError,
	AuthenticationError,
	InvalidCredentialsError,
	TokenExpiredError,
	AuthorizationError,
	InsufficientPermissionsError,
	NotFoundError,
	ResourceNotFoundError,
	BusinessLogicError,
	ConflictError,
	DuplicateEntryError,
	InsufficientFundsError,
	InvalidStateError,
	DatabaseError,
	DatabaseConnectionError,
	DatabaseTimeoutError,
	InternalError,
	ResolverError,
	OperationNotAllowedError,
	ErrorCode,
	type ErrorOptions,
} from "./errors";

export type {
	ErrorType,
	GraphQLErrorContext,
	CaptureExceptionContext,
	SpanContext,
	PrismaErrorContext,
} from "./types";
