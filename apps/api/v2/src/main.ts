import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ZodValidationPipe } from "nestjs-zod";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { SentryExceptionFilter, SentryModule } from "./common/observability";
import type { INestApplication } from "@nestjs/common";
import compression from "compression";

SentryModule.init();

function setupSecurity(app: INestApplication, configService: ConfigService) {
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					styleSrc: ["'self'", "'unsafe-inline'"],
					fontSrc: ["'self'", "data:"],
					imgSrc: ["'self'", "data:", "blob:"],
					scriptSrc: ["'self'"],
					connectSrc: ["'self'", "ws:", "wss:"],
					frameAncestors: ["'none'"],
				},
			},
			crossOriginEmbedderPolicy: true,
			crossOriginOpenerPolicy: true,
			crossOriginResourcePolicy: { policy: "same-site" },
			dnsPrefetchControl: { allow: false },
			frameguard: { action: "deny" },
			hsts: {
				maxAge: 31536000, // 1 year
				includeSubDomains: true,
				preload: true,
			},
			ieNoOpen: true,
			noSniff: true,
			originAgentCluster: true,
			permittedCrossDomainPolicies: { permittedPolicies: "none" },
			referrerPolicy: { policy: "strict-origin-when-cross-origin" },
			xssFilter: true,
		}),
	);

	const allowedOrigins = configService.get<string>("ALLOWED_ORIGINS") || [
		"http://localhost:3000",
	];

	app.enableCors({
		origin: (
			origin: string | undefined,
			callback: (err: Error | null, allow?: boolean) => void,
		) => {
			if (!origin) {
				return callback(null, true);
			}

			if (allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"X-Requested-With",
			"X-Store-Id",
		],
		exposedHeaders: ["Content-Range", "X-Content-Range"],
		maxAge: 600,
	});
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix("/api/v2");

	const configService = app.get(ConfigService);

	setupSecurity(app, configService);

	app.use(cookieParser());

	app.use(compression());
	app.useGlobalPipes(new ZodValidationPipe());
	app.useGlobalFilters(new SentryExceptionFilter());

	app.enableShutdownHooks();

	try {
		const port = configService.get("PORT");
		await app.listen(port);
		console.log(`Application is running on: http://localhost:${port}`);
	} catch (error) {
		console.error("❌ Failed to start application:", error);
		process.exit(1);
	}
}

bootstrap();
