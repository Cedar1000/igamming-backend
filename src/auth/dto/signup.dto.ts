import { Entity } from 'typeorm';

import { IsNotEmpty } from 'class-validator';

@Entity()
export class SignUpDto {
  @IsNotEmpty()
  username: string;
}
