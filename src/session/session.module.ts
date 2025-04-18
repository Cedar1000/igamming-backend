import { Module } from '@nestjs/common';
import { SessionGateway } from './session.gateway';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';

import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/auth/entities/user.entity';
import { Session } from './entities/session.entity';
import { Participation } from 'src/participation/entities/participation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session, Participation])],
  controllers: [SessionController],
  providers: [SessionGateway, SessionService],
})
export class SessionModule {}
