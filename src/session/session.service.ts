import { Injectable } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Cron, CronExpression } from '@nestjs/schedule';

import { SessionGateway } from './session.gateway';

// Entities
import { User } from '../auth/entities/user.entity';
import { Session } from '../session/entities/session.entity';
import { Participation } from '../participation/entities/participation.entity';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionGateway: SessionGateway,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,

    @InjectRepository(Participation)
    private readonly participationRepository: Repository<Participation>,
  ) {}

  findAll() {
    return `This action returns all session`;
  }

  async getActiveSession() {
    const nextSession = await this.sessionRepository.findOne({
      where: { endTime: MoreThan(new Date()) },

      order: { endTime: 'ASC' },
    });

    return { status: 'success', data: nextSession };
  }

  findOne(id: number) {
    return `This action returns a #${id} session`;
  }

  remove(id: number) {
    return `This action removes a #${id} session`;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCreateSession() {
    // console.log('session creation');

    // generate random number between 1 and 10
    // const randomNumber = Math.floor(Math.random() * 10) + 1;
    const randomNumber = 5;

    // update previous session with random number
    const [previousSession] = await this.sessionRepository.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });

    let winners: Participation[];

    if (previousSession) {
      previousSession.winningNumber = randomNumber;
      await this.sessionRepository.save(previousSession);

      // update all session participants with win or loose
      const participants = await this.participationRepository.find({
        where: { sessionId: previousSession.id },
      });

      console.log({ participants });

      const promises = participants.map(async (participant) => {
        const isWinner = participant.chosenNumber === randomNumber;

        //update that participant with win or loose
        await this.participationRepository.update(participant.id, {
          isWinner,
        });

        const totalWins = await this.participationRepository.count({
          where: { userId: participant.userId, isWinner: true },
        });

        const totalLosses = await this.participationRepository.count({
          where: { userId: participant.userId, isWinner: false },
        });

        await this.userRepository.update(participant.userId, {
          totalWins,
          totalLosses,
        });

        return this.participationRepository.findOne({
          where: { id: participant.id },
          relations: ['user'],
        });
      });

      const updateParticipants = await Promise.all(promises);

      console.log({ updateParticipants });

      winners = updateParticipants.filter(
        (participant) => participant.isWinner,
      );
    }

    const now = new Date();

    const startTime = new Date(now.getTime() + 30 * 1000); // now + 30s
    const endTime = new Date(now.getTime() + 60 * 1000); // now + 60s

    const session = this.sessionRepository.create({
      startTime,
      endTime,
    });

    const newSession = await this.sessionRepository.save(session);

    // Emit to connected clients
    this.sessionGateway.server.emit('new-session', {
      newSession,
      result: randomNumber,
      winners,
      totalPlayers: previousSession.playerCount,
    });
  }
}
