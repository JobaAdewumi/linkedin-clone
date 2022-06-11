import { User } from '../../auth/models/user.model';
import { Conversation } from './conversation.interface';

export interface Message {
  id?: number;
  message?: string;
  user?: User;
  conversation?: Conversation;
  createdAt?: Date;
}
