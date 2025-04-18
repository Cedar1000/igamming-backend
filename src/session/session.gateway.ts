/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  OnGatewayInit,
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';

import { promisify } from 'util';
import * as jwt from 'jsonwebtoken';

import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

//Entities
import { User } from '../auth/entities/user.entity';
import { Session } from './entities/session.entity';
import { Participation } from '../participation/entities/participation.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class SessionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  users: any = {};
  clientIds: any = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,

    @InjectRepository(Participation)
    private readonly participationRepository: Repository<Participation>,
  ) {}

  afterInit() {
    this.logger.log('Socket initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    const params = client.handshake.url.split('?');
    const userData = new URLSearchParams(params[1]);
    const { userId } = Object.fromEntries(userData.entries());

    this.users[userId] = client.id;

    this.clientIds[client.id] = userId;

    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.clientIds[client.id];

    if (userId) delete this.users[userId];

    delete this.clientIds[client.id];

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('number-pick')
  async handleNumberPick(client: Socket, message: any): Promise<void> {
    const { sessionId, userId, number } = message;

    // find the session
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) return;

    // find the user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) return;

    // update participation with the number
    const participation = await this.participationRepository.findOne({
      where: { sessionId, userId },
      relations: ['user'],
    });

    if (!participation) return;

    participation.chosenNumber = number;

    const update = await this.participationRepository.save(participation);

    console.log({ update });

    const count = await this.participationRepository.count({
      where: { sessionId, chosenNumber: Between(0, 11) },
    });

    console.log({ responseCount: count });

    // update the session with the number of responses
    await this.sessionRepository.update(sessionId, {
      responseCount: count,
    });

    // client.to(sessionId).emit('number-picked', {
    //   clientId: client.id,
    //   number,
    // });

    const updatedSession = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    this.server.emit('number-picked', {
      clientId: client.id,
      number,
      respondCount: count,
      session: updatedSession,
    });

    this.logger.log(`Client ${client.id} picked number ${number}`);
  }

  @SubscribeMessage('join-session')
  async handleJoinRoom(
    client: Socket,
    payload: { sessionId: string; token: string },
  ) {
    const { sessionId, token } = payload;

    const decoded: any = await promisify<string, string>(jwt.verify)(
      token,
      // @ts-expect-error
      process.env.JWT_SECRET as string,
    );

    // 3) Check if user still exists
    // Implement logic to retrieve user from database

    const user = await this.userRepository.findOne({
      where: { id: decoded.id },
    });

    console.log({ payload });

    // find the session
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    console.log({ session });

    if (!session) return;

    client.join(sessionId); // User joins the session

    // find the user

    if (!user) return;

    const data = this.participationRepository.create({
      user,
      session,
    });

    await this.participationRepository.save(data);

    const count = await this.participationRepository.count({
      where: { sessionId },
    });

    // update the session with the number of players
    const update = await this.sessionRepository.update(sessionId, {
      playerCount: count,
    });

    console.log({ update });

    this.logger.log(`Client ${client.id} joined session ${sessionId}`);

    const updatedSession = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    // Optional: notify others in the room
    this.server.emit('user-joined', {
      clientId: client.id,
      userId: user.id,
      sessionId,
      playerCount: count,
      responseCount: session.responseCount,
      session: updatedSession,
      token,
    });
  }
}
