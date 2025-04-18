import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Participation } from 'src/participation/entities/participation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ default: 0 })
  totalWins: number;

  @Column({ default: 0 })
  totalLosses: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Participation, (participation) => participation.user)
  participations: Participation[];
}
