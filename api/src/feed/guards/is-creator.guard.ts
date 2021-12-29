import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { map, Observable, switchMap } from 'rxjs';
import { User } from 'src/auth/models/user.interface';

import { UserService } from 'src/auth/services/user.service';
import { FeedPost } from '../models/post.interface';
import { FeedService } from './../services/feed.service';

@Injectable()
export class IsCreatorGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private feedService: FeedService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, params }: { user: User; params: { id: number } } = request;

    if (!user || !params) return null;

    if (user.role === 'admin') return true; //* Allow admins to make get requests

    const userId = user.id;
    const paramsId = params.id;

    //* Determine if the logged-in user is the same as the user that created the feed post
    return this.userService.findUserById(userId).pipe(
      switchMap((user: User) => {
        return this.feedService.findPostById(paramsId).pipe(
          map((feedPost: FeedPost) => {
            let isAuthor = user.id === feedPost.author.id;
            return isAuthor;
          }),
        );
      }),
    );
  }
}
