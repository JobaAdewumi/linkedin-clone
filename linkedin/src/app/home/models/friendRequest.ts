import { User } from "src/app/auth/models/user.model";

export type FriendRequest_Status =
  | 'not-sent'
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'waiting-for-current-user-response';

export interface FriendRequestStatus {
  status?: FriendRequest_Status;
}

export interface FriendRequest {
  id: number;
  creatorId: number;
  recieverId: number;
  status?: FriendRequest_Status;
}






















