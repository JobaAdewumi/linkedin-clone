import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { of, throwError } from 'rxjs';

import { AuthService } from './auth.service';

import { User } from './../../../../../api/src/auth/models/user.class';
import { NewUser } from './../models/newUser.model';

let httpClientSpy: { post: jasmine.Spy };
let routerSpy: Partial<Router>;

let authService: AuthService;

const mockNewUser: NewUser = {
  firstName: 'Joba',
  lastName: 'Adewumi',
  email: 'joba@gmail.com',
  password: 'password',
};

beforeEach(() => {
  httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
  routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

  authService = new AuthService(httpClientSpy as any, routerSpy as any);
});

describe('AuthService', () => {
  //! Massive error in this describe method with the role and subscribe method arguments
  describe('register', () => {
    // it('should return the user', (done: DoneFn) => {
    //   const expectedUser: User = {
    //     id: 1,
    //     firstName: 'Joba',
    //     lastName: 'Adewumi',
    //     email: 'joba@gmail.com',
    //     imagePath: null,
    //     role: 'user',
    //     posts: null,
    //   };

    //   httpClientSpy.post.and.returnValue(of(expectedUser));

    //   authService.register(mockNewUser).subscribe((user: User) => {
    //     expect(typeof user.id).toEqual('number');
    //     expect(user.firstName).toEqual(mockNewUser.firstName);
    //     expect(user.email).toEqual(mockNewUser.email);
    //     expect(user.lastName).toEqual(mockNewUser.lastName);
    //     expect((user as any).password).toBeUndefined();
    //     expect(user.role).toEqual('user');
    //     expect(user.imagePath).toBeNull();
    //     expect(user.posts).toBeNull();

    //     done();
    //   });
    //   expect(httpClientSpy.post.calls.count()).toBe(1, 'one call');
    // });

    //! Massive error with error response
    // it('should return an error if email already exists', (done: DoneFn) => {
    //   const errorResponse = new HttpErrorResponse({
    //     error: 'A user has already been created with this email address',
    //     status: 400,
    //   });

    //   httpClientSpy.post.and.returnValue(throwError(() => errorResponse));

    //   authService.register(mockNewUser).subscribe({
    //     next: () => {
    //       done.fail('expected a bad request error');
    //     },
    //     error: (httpErrorResponse: HttpErrorResponse) => {
    //       expect(httpErrorResponse.error).toContain('already been created');
    //       done();
    //     },
    //   });
    // });
  });
});
