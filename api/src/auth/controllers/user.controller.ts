import { map, switchMap } from 'rxjs/operators';
import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  Res,
  Get,
  Param,
  Put,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { Observable, of } from 'rxjs';
import { JwtGuard } from '../guards/jwt.guard';
import { saveImageToStorage } from '../helpers/image-storage';
import { UserService } from '../services/user.service';
import { User } from '../models/user.class';
import {
  FriendRequest,
  FriendRequestStatus,
} from '../models/friend-request.interface';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', saveImageToStorage))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Observable<{ modifiedFileName: string } | { error: string }> {
    const fileName = file?.filename;

    if (!fileName) return of({ error: 'File must be a png, jpg/jpeg' });

    const imagesFolderPath = join(process.cwd(), 'images');
    const fullImagePath = join(imagesFolderPath + '/' + file.filename);

    const userId = req.user.id;

    return this.userService.updateUserImageById(userId, fileName).pipe(
      map(() => ({
        modifiedFileName: file.filename,
      })),
    );

    // return isFileExtensionSafe(fullImagePath).pipe(
    //   switchMap((isFileLegit: boolean) => {
    //     if (isFileLegit) {
    //       const userId = req.user.id;
    //       return this.userService.updateUserImageById(userId, fileName);
    //     }
    //     removeFile(fullImagePath);
    //     return of({ error: 'File content does not match extension!' });
    //   }),
    // );
  }

  @UseGuards(JwtGuard)
  @Get('image')
  findImage(@Request() req, @Res() res): Observable<Object> {
    const userId = req.user.id;
    return this.userService.findImageNameByUserId(userId).pipe(
      switchMap((imageName: string) => {
        return of(res.sendFile(imageName, { root: './images' }));
      }),
    );
  }

  @UseGuards(JwtGuard)
  @Get('image-name')
  findUserImageName(@Request() req): Observable<{ imageName: string }> {
    const userId = req.user.id;
    return this.userService.findImageNameByUserId(userId).pipe(
      switchMap((imageName: string) => {
        return of({ imageName });
      }),
    );
  }

  @UseGuards(JwtGuard)
  @Get(':userId')
  findUserById(@Param('userId') userStringId: string): Observable<User> {
    const userId = parseInt(userStringId);
    return this.userService.findUserById(userId);
  }

  @UseGuards(JwtGuard)
  @Post('friend-request/send/:recieverId')
  sendFriendRequest(
    @Param('recieverId') recieverStringId: string,
    @Request() req,
  ): Observable<FriendRequest | { error: string }> {
    const recieverId = parseInt(recieverStringId);
    return this.userService.sendFriendRequest(recieverId, req.user);
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/status/:recieverId')
  getFriendRequestStatus(
    @Param('recieverId') recieverStringId: string,
    @Request() req,
  ): Observable<FriendRequestStatus> {
    const recieverId = parseInt(recieverStringId);
    return this.userService.getFriendRequestStatus(recieverId, req.user);
  }

  @UseGuards(JwtGuard)
  @Put('friend-request/response/:friendRequestId')
  respondToFriendRequest(
    @Param('friendRequestId') friendRequestStringId: string,
    @Body() statusResponse: FriendRequestStatus,
  ): Observable<FriendRequestStatus> {
    const friendRequestId = parseInt(friendRequestStringId);
    return this.userService.respondToFriendRequest(
      statusResponse.status,
      friendRequestId,
    );
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/me/recieved-requests')
  getFriendRequestFromRecipients(@Request() req): Observable<FriendRequest[]> {
    return this.userService.getFriendRequestFromRecipients(req.user);
  }

  @UseGuards(JwtGuard)
  @Get('friends/my')
  getFriends(@Request() req): Observable<User[]> {
    return this.userService.getFriends(req.user);
  }
}
