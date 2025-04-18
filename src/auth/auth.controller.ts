import {
  Res,
  Get,
  Body,
  Post,
  Param,
  Patch,
  Query,
  HttpCode,
  UsePipes,
  Controller,
  ValidationPipe,
} from '@nestjs/common';

import { Response } from 'express';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

import IQuery from 'interfaces/query.Interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @HttpCode(201)
  @UsePipes(ValidationPipe)
  async signup(@Body() payload: SignUpDto) {
    return this.authService.signUp(payload);
  }

  @Post('/login')
  @HttpCode(200)
  @UsePipes(ValidationPipe)
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @Get('/users')
  async getAllUser(@Query() query: Partial<IQuery>) {
    return this.authService.findAll(query);
  }

  @Get('/users/:id')
  async getSingleUser(
    @Param('id') id: string,
    @Query() query: Partial<IQuery>,
  ) {
    return this.authService.getSingleUser(id, query);
  }

  @Get('/get-me')
  async getMe(@Res() res: Response) {
    const { user } = res.locals;

    const result = await this.authService.getMe(user);

    return res.status(200).json(result);
  }

  @Patch('/users/update-me')
  @UsePipes(ValidationPipe)
  async updateAuthUser(
    id: string,
    @Body() payload: SignUpDto,
    @Res() res: Response,
  ) {
    const { user } = res.locals;

    const result = await this.authService.updateAuthUser(user.id, payload);

    return res.status(200).json({ status: 'success', result });
  }
}
