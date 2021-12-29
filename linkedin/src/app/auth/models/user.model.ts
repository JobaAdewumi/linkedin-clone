export type Role = 'admin' | 'premium' | 'user';

//* Defines the parameters going to the database to login an existing user

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role
}