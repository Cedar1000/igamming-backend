import {
  Module,
  NestModule,
  RequestMethod,
  MiddlewareConsumer,
} from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule } from '@nestjs/config';

// Modules
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';

//Entitie
import { User } from './auth/entities/user.entity';

// Middlewares
import { ProtectMiddleware } from './middlewares/protect.middleware';
import { ParticipationModule } from './participation/participation.module';
import { SessionModule } from './session/session.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot({ isGlobal: true }),

    ScheduleModule.forRoot(),

    DatabaseModule,
    AuthModule,
    ParticipationModule,
    SessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProtectMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/signup', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
