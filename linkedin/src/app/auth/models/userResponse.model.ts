import { User } from './user.model';

//* Defines the response of the json web token received from the database
export interface userResponse {
  user: User;
  exp: number;
  ist: number;
}
