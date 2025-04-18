import { Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UsernameValidationMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { username } = req.body;

    if (!username) {
      throw new BadRequestException('No username passed in');
    }

    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new BadRequestException('No user with that username');
    }

    next();
  }
}
