import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Participation } from 'src/participation/entities/participation.entity';

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ default: 0 })
  playerCount: number;

  @Column({ default: 0 })
  responseCount: number;

  @Column({ nullable: true })
  winningNumber: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Participation, (player) => player.session)
  players: Participation[];
}
