import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { Repository, UpdateResult } from 'typeorm';
import { FriendRequestEntity } from '../models/friend-request.entity';
import {
  FriendRequest,
  FriendRequestStatus,
  FriendRequest_Status,
} from '../models/friend-request.interface';
import { UserEntity } from '../models/user.entity';
import { User } from '../models/user.class';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FriendRequestEntity)
    private readonly friendRequestRepository: Repository<FriendRequestEntity>,
  ) {}

  findUserById(id: number): Observable<User> {
    return from(
      this.userRepository.findOne({ id }, { relations: ['feedPosts'] }),
    ).pipe(
      map((user: User) => {
        if (!user) {
          throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        delete user.password;
        return user;
      }),
    );
  }

  updateUserImageById(id: number, imagePath: string): Observable<UpdateResult> {
    const user: User = new UserEntity();
    user.id = id;
    user.imagePath = imagePath;
    return from(this.userRepository.update(id, user));
  }

  findImageNameByUserId(id: number): Observable<string> {
    return from(this.userRepository.findOne({ id })).pipe(
      map((user: User) => {
        delete user.password;
        return user.imagePath;
      }),
    );
  }

  hasRequestbeenSentOrreceived(
    creator: User,
    reciever: User,
  ): Observable<boolean> {
    return from(
      this.friendRequestRepository.findOne({
        where: [
          { creator, reciever },
          { creator: reciever, reciever: creator },
        ],
      }),
    ).pipe(
      switchMap((friendRequest: FriendRequest) => {
        if (!friendRequest) return of(false);
        return of(true);
      }),
    );
  }

  sendFriendRequest(
    recieverId: number,
    creator: User,
  ): Observable<FriendRequest | { error: string }> {
    if (recieverId === creator.id)
      return of({ error: 'It is not possible to add yourself!' });

    return this.findUserById(recieverId).pipe(
      switchMap((reciever: User) => {
        return this.hasRequestbeenSentOrreceived(creator, reciever).pipe(
          switchMap((hasRequestbeenSentOrreceived: boolean) => {
            if (hasRequestbeenSentOrreceived)
              return of({
                error:
                  'A friend request has already been sent or received to your account!',
              });
            let friendRequest: FriendRequest = {
              creator,
              reciever,
              status: 'pending',
            };
            return from(this.friendRequestRepository.save(friendRequest));
          }),
        );
      }),
    );
  }

  getFriendRequestStatus(
    recieverId: number,
    currentUser: User,
  ): Observable<FriendRequestStatus> {
    return this.findUserById(recieverId).pipe(
      switchMap((reciever: User) => {
        return from(
          this.friendRequestRepository.findOne({
            where: [
              {
                creator: currentUser,
                reciever: reciever,
              },
              { creator: reciever, reciever: currentUser },
            ],
            relations: ['creator', 'reciever'],
          }),
        );
      }),
      switchMap((friendRequest: FriendRequest) => {
        if (friendRequest?.reciever.id === currentUser.id) {
          return of({
            status: 'waiting-for-current-user-response' as FriendRequest_Status,
          });
        }
        return of({ status: friendRequest?.status || 'not-sent' });
      }),
    );
  }

  getFriendRequestUserById(friendRequestId: number): Observable<FriendRequest> {
    return from(
      this.friendRequestRepository.findOne({
        where: [{ id: friendRequestId }],
      }),
    );
  }

  respondToFriendRequest(
    statusResponse: FriendRequest_Status,
    friendRequestId: number,
  ): Observable<FriendRequestStatus> {
    return this.getFriendRequestUserById(friendRequestId).pipe(
      switchMap((friendRequest: FriendRequest) => {
        return from(
          this.friendRequestRepository.save({
            ...friendRequest,
            status: statusResponse,
          }),
        );
      }),
    );
  }

  getFriendRequestFromRecipients(
    currentUser: User,
  ): Observable<FriendRequest[]> {
    return from(
      this.friendRequestRepository.find({
        where: [{ reciever: currentUser }],
        relations: ['reciever', 'creator'],
      }),
    );
  }

  getFriends(currentUser: User): Observable<User[]> {
    return from(
      this.friendRequestRepository.find({
        where: [
          { creator: currentUser, status: 'accepted' },
          { reciever: currentUser, status: 'accepted' },
        ],
        relations: ['creator', 'reciever'],
      }),
    ).pipe(
      switchMap((friends: FriendRequest[]) => {
        let userIds: number[] = [];

        friends.forEach((friend: FriendRequest) => {
          if (friend.creator.id === currentUser.id) {
            userIds.push(friend.reciever.id);
          } else if (friend.reciever.id === currentUser.id) {
            userIds.push(friend.creator.id);
          }
        });

        return from(this.userRepository.findByIds(userIds));
      }),
    );
  }
}
