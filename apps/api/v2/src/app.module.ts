import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from "@nestjs/graphql"
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DatabaseModule } from './database/database.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ConfigModule } from "@nestjs/config"
import { ZodValidationPipe } from 'nestjs-zod';
import { UtilsModule } from './utils/utils.module';
import { Request } from 'express';
import { ProductModule } from './modules/product/product.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { ReportModule } from './modules/report/report.module';
import { SaleModule } from './modules/sale/sale.module';
import { UserModule } from './modules/user/user.module';
import { SettingsModule } from './modules/settings/settings.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "../.env",
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      context: ({ req }: { req: Request }) => ({ req })
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
    NotificationModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: "APP_PIPE",
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule { }
