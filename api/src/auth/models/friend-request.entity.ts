import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FriendRequest_Status } from './friend-request.interface';
import { UserEntity } from './user.entity';

@Entity('request')
export class FriendRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (userentity) => userentity.sentFriendRequests)
  creator: UserEntity;

  @ManyToOne(
    () => UserEntity,
    (userentity) => userentity.receivedFriendRequests,
  )
  reciever: UserEntity;

  @Column()
  status: FriendRequest_Status;
}
