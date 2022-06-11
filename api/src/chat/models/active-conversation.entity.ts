import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../auth/models/user.entity';

@Entity('active_conversation')
export class ActiveConversationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  socketId: string;

  @Column()
  userId: number;

  @Column()
  conversationId: number;
}
