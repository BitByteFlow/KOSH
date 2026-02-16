import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {GraphQLModule} from "@nestjs/graphql"
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import {ConfigModule} from "@nestjs/config"
import { ZodValidationPipe } from 'nestjs-zod';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "../.env"
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
    }),
    AccountsModule,
    AuthModule,
    CategoriesModule
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
export class AppModule {}
