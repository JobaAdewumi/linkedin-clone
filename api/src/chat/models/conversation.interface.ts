import { User } from '../../auth/models/user.class';

export interface Conversation {
  id?: number;
  users?: User[];
  lastUpdated?: Date;
}
