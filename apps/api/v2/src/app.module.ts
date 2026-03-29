import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { DatabaseModule } from "./database/database.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ConfigModule } from "@nestjs/config";
import { ZodValidationPipe } from "nestjs-zod";
import { UtilsModule } from "./utils/utils.module";
import { ProductModule } from "./modules/product/product.module";
import { PurchaseModule } from "./modules/purchase/purchase.module";
import { ReportModule } from "./modules/report/report.module";
import { SaleModule } from "./modules/sale/sale.module";
import { UserModule } from "./modules/user/user.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { StoreModule } from "./modules/store/store.module";
import { StoreMemberModule } from "./modules/storeMember/storeMember.module";
import { StoreJoinRequestModule } from "./modules/storeJoinRequest/storeJoinRequest.module";
import { SentryModule } from "./common/sentry/sentry.module";
import { SentryService, PrismaErrorHandler, SentryGraphQLInterceptor } from "./common/sentry";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { Request } from "express";

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: "../.env",
			isGlobal: true,
		}),
		// Initialize Sentry after ConfigModule so it can access environment variables
		SentryModule.forRoot(),
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: true,
			sortSchema: true,
			subscriptions: {
				"graphql-ws": true,
			},
			context: ({ req, extra }: { req: Request; extra: any }) => {
				// For subscriptions, the user data is in extra.user (if populated by onConnect)
				// or we might need to handle it differently depending on the auth setup.
				return { req: req || extra?.request };
			},
		}),
		DatabaseModule,
		AccountsModule,
		AuthModule,
		CategoriesModule,
		UtilsModule,
		ProductModule,
		PurchaseModule,
		ReportModule,
		SaleModule,
		UserModule,
		SettingsModule,
		NotificationModule,
		StoreModule,
		StoreMemberModule,
		StoreJoinRequestModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: "APP_PIPE",
			useClass: ZodValidationPipe,
		},
		// Register Sentry GraphQL interceptor globally for all resolvers
		{
			provide: APP_INTERCEPTOR,
			useFactory: (sentryService: SentryService) => {
				return new SentryGraphQLInterceptor(sentryService);
			},
			inject: [SentryService],
		},
		// Provide SentryService for use in resolvers and services
		SentryService,
		// Provide PrismaErrorHandler for use in services
		PrismaErrorHandler,
	],
})
export class AppModule {}
