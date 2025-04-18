/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';

import { Request, Response, NextFunction } from 'express';
import { promisify } from 'util';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ProtectMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let token = null;

    // 1) Check if json web token exists and get token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // If there's no token then throw exception
      throw new UnauthorizedException(
        'You are not logged in!!!! Please log in to access this resource',
      );
    }

    try {
      // 2) Verify token
      const decoded: any = await promisify<string, string>(jwt.verify)(
        token,
        // @ts-expect-error
        process.env.JWT_SECRET as string,
      );

      // 3) Check if user still exists
      // Implement logic to retrieve user from database

      const currentUser = await this.userRepository.findOne({
        where: { id: decoded.id },
      });

      if (!currentUser) {
        throw new NotFoundException(
          "Can't find user with that token. Please try again",
        );
      }

      // 4) Check if user changed password after json web token was issued
      // Replace currentUser.changedPasswordAfter with your own logic
      // if (currentUser.changedPasswordAfter(decoded.iat)) {
      //   return next(new Error('User recently changed password. Please log in again'));
      // }

      // Grant Access
      res.locals.user = currentUser;

      next();
    } catch (error) {
      // Handle JWT verification errors
      throw new ForbiddenException(error.message);
    }
  }
}
