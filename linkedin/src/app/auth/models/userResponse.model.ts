import { User } from "./user.model";

//* Defines the response of the json web token recieved from the database
export interface userResponse {
    user: User;
    exp: number;
    ist: number;
}