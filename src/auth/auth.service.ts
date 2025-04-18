import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';

import IQuery from '../../interfaces/query.Interface';

import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

import {
  getAll,
  getOne,
  createOne,
  updateOneOne,
} from '../../utils/handlerFactory';

import signToken from '../../utils/signToken';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { username } = signUpDto;

    //check email
    const check = await this.userRepository.findOne({
      where: { username },
    });

    if (check) {
      throw new ConflictException('a user already exists with that username');
    }

    const result = await createOne(this.userRepository, signUpDto);

    const { id } = result.data;

    const { token, refreshToken } = signToken(id);

    return { token, refreshToken, user: result.data };
  }

  async login(Logindto: LoginDto) {
    const { username } = Logindto;

    // Find User From Database
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new BadRequestException('No user with that username!');
    }

    const { token, refreshToken } = signToken(user.id);

    return {
      status: 'success',
      token,
      refreshToken,
      user,
    };
  }

  async getMe(user: User) {
    return { status: 'success', user };
  }

  async getSingleUser(id: string, query: Partial<IQuery>) {
    return await getOne(this.userRepository, id, query);
  }

  async findAll(query: IQuery) {
    return await getAll(this.userRepository, query);
  }

  async updateAuthUser(id: string, payload: SignUpDto) {
    return await updateOneOne(this.userRepository, id, payload);
  }
}
