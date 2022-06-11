import { Conversation } from './conversation.interface';
import { User } from '../../auth/models/user.class';

export interface Message {
  id?: number;
  message?: string;
  user?: User;
  conversation?: Conversation;
  createdAt?: Date;
}
