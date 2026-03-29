export { SentryModule } from "./sentry.module";
export { SentryService, ErrorType, type GraphQLErrorContext } from "./sentry.service";

export { SentryGraphQLInterceptor } from "./sentryGraphql.interceptor";

export {
  PrismaErrorHandler,
  DatabaseError,
  type PrismaErrorContext,
} from "./prismaError.handler";

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
  DatabaseError as SentryDatabaseError,
  DatabaseConnectionError,
  DatabaseTimeoutError,
  InternalError,
  ResolverError,
  OperationNotAllowedError,
  ErrorCode,
  type ErrorOptions,
} from "./errors";

export {
  redactSensitiveData,
  redactGraphQLVariables,
  redactGraphQLQuery,
  createSafeContext,
  redactRequestData,
  type RedactionOptions,
} from "./redaction";
