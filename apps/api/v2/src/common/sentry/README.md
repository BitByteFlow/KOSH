# Sentry Integration for GraphQL API

Comprehensive, production-ready Sentry integration for the Kosh GraphQL API with error tracking, performance monitoring, and sensitive data protection.

## Features

- ✅ **Automatic Error Capture**: All unhandled resolver errors are captured with rich GraphQL context
- ✅ **Performance Tracking**: Tracks execution time per GraphQL operation with configurable sampling
- ✅ **Prisma Error Handling**: Graceful handling of database errors with user-friendly messages
- ✅ **Sensitive Data Redaction**: Automatic redaction of PII, passwords, tokens, and other sensitive data
- ✅ **Error Classification**: Distinguishes between validation, authentication, authorization, business logic, and system errors
- ✅ **Low Overhead**: Configurable sampling rates ensure <5% latency impact
- ✅ **Axiom + Grafana Compatible**: Designed to complement existing observability stack

## Installation

Dependencies are already installed:

```json
{
  "@sentry/nestjs": "^10.46.0",
  "@sentry/profiling-node": "^10.46.0"
}
```

## Configuration

### Environment Variables

| Variable | Description | Default | Production Recommendation |
|----------|-------------|---------|---------------------------|
| `SENTRY_DSN` | Sentry Data Source Name | Required | Your production DSN |
| `NODE_ENV` | Environment name | `development` | `production` |
| `SENTRY_RELEASE` | Release version | Auto-detected | Git commit hash |
| `SENTRY_TRACES_SAMPLE_RATE` | Transaction sampling (0.0-1.0) | `0.1` | `0.01` - `0.1` |
| `SENTRY_PROFILES_SAMPLE_RATE` | Profiling sampling (0.0-1.0) | `0.1` | `0.01` - `0.1` |

### Production Configuration

For production deployment, adjust sampling rates based on traffic:

```bash
# High traffic (>1000 req/min)
SENTRY_TRACES_SAMPLE_RATE=0.01
SENTRY_PROFILES_SAMPLE_RATE=0.01

# Medium traffic (100-1000 req/min)
SENTRY_TRACES_SAMPLE_RATE=0.05
SENTRY_PROFILES_SAMPLE_RATE=0.05

# Low traffic (<100 req/min)
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
```

## Usage

### In Resolvers

Inject `SentryService` and `PrismaErrorHandler` for manual error reporting:

```typescript
import { Resolver, Query, Args } from '@nestjs/graphql';
import { SentryService, ErrorType } from 'src/common/sentry';
import { PrismaErrorHandler } from 'src/common/sentry';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/jwt.guard';

@Resolver()
@UseGuards(JwtAuthGuard)
export class ProductResolver {
  constructor(
    private readonly sentryService: SentryService,
    private readonly prismaHandler: PrismaErrorHandler,
  ) {}

  @Query(() => Product)
  async getProduct(@Args('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.prismaHandler.wrapPrismaOperation(
      async () => {
        const product = await this.databaseService.product.findUnique({
          where: { id },
        });
        
        if (!product) {
          // This will be logged as "info" level (expected error)
          throw new ResourceNotFoundError('Product', id);
        }
        
        return product;
      },
      {
        operation: 'findUnique',
        model: 'product',
        userId: user.id,
        args: { id },
      }
    );
  }
}
```

### Using Error Classes

Import and throw appropriate error classes for automatic Sentry classification:

```typescript
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  BusinessLogicError,
  ConflictError,
  DatabaseError,
} from 'src/common/sentry';

// Validation error (400, Sentry: warning)
throw new ValidationError('Invalid input', { field: 'email' });

// Authentication error (401, Sentry: warning)
throw new AuthenticationError();

// Authorization error (403, Sentry: warning)
throw new AuthorizationError('Admin access required');

// Not found error (404, Sentry: info)
throw new ResourceNotFoundError('User', userId);

// Business logic error (400/409, Sentry: warning)
throw new InsufficientFundsError(100, 50, 'USD');

// Database error (500, Sentry: error)
throw new DatabaseConnectionError();
```

### Manual Error Reporting

For custom error handling:

```typescript
import { SentryService, ErrorType } from 'src/common/sentry';

constructor(private readonly sentryService: SentryService) {}

async someMethod() {
  try {
    // ... some code
  } catch (error) {
    this.sentryService.captureException(error, {
      errorType: ErrorType.BUSINESS_LOGIC,
      graphqlContext: {
        operationName: 'createUser',
        query: 'mutation { createUser(...) }',
        variables: { email: 'user@example.com' }, // Will be redacted
        userId: '123',
      },
      extra: { customField: 'value' },
      level: 'warning',
    });
    throw error;
  }
}
```

### Manual Performance Tracking

For custom spans:

```typescript
import { SentryService } from 'src/common/sentry';

constructor(private readonly sentryService: SentryService) {}

async complexOperation() {
  const span = this.sentryService.startSpan(
    'complex_operation',
    'app.operation',
    {
      description: 'Processing complex data',
      tags: { team: 'backend' },
    }
  );

  try {
    // ... operation
    span.setStatus('ok');
  } catch (error) {
    span.setStatus('internal_error');
    throw error;
  } finally {
    span.end();
  }
}
```

## Error Classification

The integration automatically classifies errors for appropriate Sentry reporting:

| Error Type | HTTP Status | Sentry Level | Description |
|------------|-------------|--------------|-------------|
| `VALIDATION_ERROR` | 400 | Warning | Invalid user input |
| `AUTHENTICATION_ERROR` | 401 | Warning | Not logged in |
| `AUTHORIZATION_ERROR` | 403 | Warning | Insufficient permissions |
| `NOT_FOUND_ERROR` | 404 | Info | Resource doesn't exist |
| `BUSINESS_LOGIC_ERROR` | 400/409 | Warning | Business rule violation |
| `DATABASE_ERROR` | 500 | Error | Database operation failed |
| `INTERNAL_ERROR` | 500 | Error | Unexpected system error |

## Sensitive Data Redaction

The following fields are automatically redacted from Sentry reports:

### Authentication
- `password`, `secret`, `token`, `accessToken`, `refreshToken`
- `apiKey`, `authorization`, `cookie`, `jwt`, `session`

### Personal Information
- `email`, `phone`, `address`, `ssn`, `passport`

### Financial
- `creditCard`, `cardNumber`, `cvv`, `bankAccount`, `iban`

### Private Keys
- `privateKey`, `secretKey`, `encryptionKey`, `cert`

### Database
- `connectionString`, `databaseUrl`, `dbPassword`

To add custom keys to redact, modify `redaction.ts`:

```typescript
const DEFAULT_SENSITIVE_KEYS = [
  // ... existing keys
  'yourCustomSensitiveField',
];
```

## Prisma Error Handling

The `PrismaErrorHandler` provides graceful handling of common Prisma errors:

| Prisma Code | User Message | Retryable |
|-------------|--------------|-----------|
| P2025 | "The requested resource was not found" | No |
| P2002 | "A record with this field already exists" | No |
| P2003 | "This operation would violate a database relationship" | No |
| P2020/P2021 | "The database operation timed out" | Yes |
| P2005 | "Database is currently busy" | Yes |

## GraphQL Interceptor

The `SentryGraphQLInterceptor` is registered globally and automatically:

1. Creates a transaction for each GraphQL operation
2. Tracks resolver execution time
3. Captures errors with full context (operation name, variables, user ID)
4. Classifies errors by type
5. Adds performance breadcrumbs

## Integration with Axiom + Grafana

This integration is designed to complement your existing observability stack:

- **Sentry**: Error tracking, performance profiling, release tracking
- **Axiom**: Log aggregation and analysis
- **Grafana**: Metrics visualization and alerting

### Avoiding Duplication

1. Use Sentry for error details and stack traces
2. Use Axiom for log correlation (include Sentry event IDs in logs)
3. Use Grafana for aggregate metrics (error rates, latency percentiles)

Example log correlation:

```typescript
const eventId = this.sentryService.captureException(error);
logger.error('Operation failed', {
  sentryEventId: eventId,
  operation: 'createUser',
});
```

## Performance Optimization

### Sampling Strategy

The default sampling rate is 10% (`0.1`), which means:
- 10% of all GraphQL operations are traced
- 10% of traced operations are profiled

This provides statistically significant data while keeping overhead minimal.

### Overhead Targets

- **Error Capture**: <1ms per error
- **Transaction Creation**: <2ms per operation
- **Total Overhead**: <5% latency impact

### Monitoring Overhead

Monitor these metrics to ensure overhead stays within bounds:

```typescript
// In your monitoring dashboard
- sentry.transaction.duration (should be <2ms)
- sentry.error.capture.duration (should be <1ms)
- graphql.execution.time (compare before/after Sentry)
```

## Deployment Checklist

- [ ] Set `SENTRY_DSN` to production DSN
- [ ] Set `NODE_ENV=production`
- [ ] Set `SENTRY_RELEASE` to git commit hash
- [ ] Adjust `SENTRY_TRACES_SAMPLE_RATE` based on traffic
- [ ] Adjust `SENTRY_PROFILES_SAMPLE_RATE` based on traffic
- [ ] Verify sensitive data is being redacted (test with sample queries)
- [ ] Configure Sentry alerts for critical error types
- [ ] Set up release tracking in Sentry
- [ ] Test error reporting in staging environment

## Troubleshooting

### Errors Not Appearing in Sentry

1. Check that `SENTRY_DSN` is set correctly
2. Verify network connectivity to Sentry
3. Check Sentry project settings for rate limits
4. Ensure error is not marked with `noSentry: true` tag

### Too Many Errors Being Sent

1. Reduce `SENTRY_TRACES_SAMPLE_RATE`
2. Use appropriate error classes (validation errors are "warning" level)
3. Filter expected errors with `sendToSentry: false`

### Sensitive Data Leaking

1. Verify field names match redaction patterns
2. Add custom keys to `DEFAULT_SENSITIVE_KEYS`
3. Test with sample queries containing sensitive data

### High Latency

1. Reduce sampling rates
2. Check Sentry SDK version is up to date
3. Profile your application to identify bottlenecks

## File Structure

```
src/common/sentry/
├── index.ts                          # Barrel exports
├── sentry.module.ts                  # SentryModule configuration
├── sentry.service.ts                 # SentryService for manual reporting
├── sentry-graphql.interceptor.ts     # GraphQL interceptor
├── prisma-error-handler.ts           # Prisma error handling
├── redaction.ts                      # Sensitive data redaction
└── errors.ts                         # Custom error classes
```

## API Reference

### SentryService

```typescript
captureException(exception, options?): string | undefined
startTransaction(name, op, options?): Span | undefined
startSpan(name, op, options?): Span
setUser(user): void
setTag(key, value): void
setTags(tags): void
addBreadcrumb(breadcrumb): void
captureMessage(message, level?): string
```

### Error Classes

```typescript
new ValidationError(message, options?)
new AuthenticationError(message, options?)
new AuthorizationError(message, options?)
new NotFoundError(message, options?)
new ResourceNotFoundError(resourceType, id)
new BusinessLogicError(message, options?)
new ConflictError(message, options?)
new DuplicateEntryError(fieldName, value)
new InsufficientFundsError(required, available, currency?)
new DatabaseError(message, options?)
new DatabaseConnectionError()
new InternalError(message, options?)
```

## License

Internal use only - Kosh Project
