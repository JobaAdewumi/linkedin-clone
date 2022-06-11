import { Post } from './../../home/models/Post';

export type Role = 'admin' | 'premium' | 'user';

//* Defines the parameters going to the database to login an existing user

export interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: Role;
  imagePath?: string;
  posts?: Post[];
}
