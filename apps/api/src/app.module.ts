import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { JWTStrategy } from './utils/jwt.strategy';

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, PassportModule],
  controllers: [AppController],
  providers: [AppService, JWTStrategy],
})
export class AppModule {}
