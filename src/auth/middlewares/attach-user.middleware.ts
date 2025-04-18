import { Injectable, NestMiddleware } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AttachUserMiddleware implements NestMiddleware {
  constructor() {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { user } = res.locals;

    req.body.userId = user.id;
    req.body.user = user;

    next();
  }
}
