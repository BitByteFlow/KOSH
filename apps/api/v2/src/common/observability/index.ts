export { ObservabilityModule } from "./observability.module";

export {
	SentryModule,
	SentryService,
	SentryExceptionFilter,
	SentryGraphQLInterceptor,
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
} from "./sentry";

export type {
	ErrorType,
	GraphQLErrorContext,
	CaptureExceptionContext,
	SpanContext,
	PrismaErrorContext,
	ErrorOptions,
} from "./sentry";

export { PrismaErrorHandler } from "./prisma";

export {
	redactSensitiveData,
	redactGraphQLVariables,
	redactGraphQLQuery,
	createSafeContext,
	redactRequestData,
	safeJsonStringify,
} from "./redaction";

export type { RedactionOptions, RedactedRequestData } from "./redaction";
