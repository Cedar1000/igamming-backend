import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Session } from 'src/session/entities/session.entity';

@Entity()
export class Participation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  chosenNumber: number;

  @Column({ nullable: true })
  sessionNumber: number;

  @Column()
  userId: string;

  @Column()
  sessionId: string;

  @Column({ default: false })
  isWinner: boolean;

  @ManyToOne(() => Session, (session) => session.players)
  session: Session;

  @ManyToOne(() => User, (user) => user.participations)
  user: User;
}
