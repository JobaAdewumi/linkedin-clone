//* Defines the logic and functions used for the authenktication page
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { NewUser } from './../models/newUser.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { userResponse } from '../models/userResponse.model';
import jwt_decode from 'jwt-decode';
import { Storage } from '@capacitor/storage';
import { of } from 'rxjs';
import { Role } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //* Creates a RXJS behaviour subject for the role authentication
  private user$ = new BehaviorSubject<User>(null);

  //* Injects the http methods for connecting to the backend
  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  get userStream(): Observable<User> {
    return this.user$.asObservable();
  }

  //* To make sure the user is logged in before the user can be routed to the home page
  get isUserLoggedIn(): Observable<boolean> {
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        const isUserAuthenticated = user !== null;
        return of(isUserAuthenticated);
      })
    );
  }

  //* To the logged in user role for user specific functions
  get userRole(): Observable<Role> {
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        return of(user?.role); //? for after signed out, but still subscribed
        //? If you want to add role based authorization you can add if else statements
        //* Return false if admin return false
        //* You can have another guard is premium return false and for user and so on
      })
    );
  }

  get userId(): Observable<number> {
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        return of(user.id);
      })
    );
  }

  get userFullName(): Observable<string> {
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        if (!user) {
          return of(null);
        }
        const fullName = user.firstName + ' ' + user.lastName;
        return of(fullName);
      })
    );
  }

  get userFullImagePath(): Observable<string> {
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        const doesAuthorHaveImage = !!user?.imagePath;
        let fullImagePath = this.getDefaultFullImagePath();
        if (doesAuthorHaveImage) {
          fullImagePath = this.getFullImagePath(user.imagePath);
        }
        return of(fullImagePath);
      })
    );
  }

  //* Injects the angular http client method and router class
  constructor(private http: HttpClient, private router: Router) {}

  getDefaultFullImagePath(): string {
    return 'http://localhost:3000/api/feed/image/blank-profile-picture.png';
  }

  getFullImagePath(imageName: string): string {
    return 'http://localhost:3000/api/feed/image/' + imageName;
  }

  getUserImage() {
    return this.http.get(`${environment.baseApiUrl}/user/image`).pipe(take(1));
  }

  getUserImageName(): Observable<{ imageName: string }> {
    return this.http
      .get<{ imageName: string }>(`${environment.baseApiUrl}/user/image-name`)
      .pipe(take(1));
  }

  updateUserImagePath(imagePath: string): Observable<User> {
    return this.user$.pipe(
      take(1),
      map((user: User) => {
        user.imagePath = imagePath;
        this.user$.next(user);
        return user;
      })
    );
  }

  uploadUserImage(
    formData: FormData
  ): Observable<{ modifiedFileName: string }> {
    return this.http
      .post<{ modifiedFileName: string }>(
        `${environment.baseApiUrl}/user/upload`,
        formData
      )
      .pipe(
        tap(({ modifiedFileName }) => {
          let user = this.user$.value;
          user.imagePath = modifiedFileName;
          this.user$.next(user);
        })
      );
  }

  //* Logic to route the user when they register
  register(newUser: NewUser): Observable<User> {
    return this.http
      .post<User>(
        `${environment.baseApiUrl}/auth/register`,
        newUser,
        this.httpOptions
      )
      .pipe(take(1));
  }

  //* Logic to route the user when they login
  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(
        `${environment.baseApiUrl}/auth/login`,
        { email, password },
        this.httpOptions
      )
      .pipe(
        take(1),
        tap((response: { token: string }) => {
          //* To save the json web token collected from the backend to a local storage instead of the database
          //* Using a capacitor plugin
          Storage.set({
            key: 'token',
            value: response.token,
          });
          const decodedToken: userResponse = jwt_decode(response.token);
          this.user$.next(decodedToken.user);
        })
      );
  }

  isTokenInStorage(): Observable<boolean> {
    return from(
      Storage.get({
        key: 'token',
      })
    ).pipe(
      map((data: { value: string }) => {
        if (!data || !data.value) return null;

        const decodedToken: userResponse = jwt_decode(data.value);
        const jwtExpirationInMsSinceUnixEpoch = decodedToken.exp * 1000;
        const isExpired =
          new Date() > new Date(jwtExpirationInMsSinceUnixEpoch);

        if (isExpired) return null;
        if (decodedToken.user) {
          this.user$.next(decodedToken.user);
          return true;
        }
      })
    );
  }

  logout(): void {
    this.user$.next(null);
    Storage.remove({ key: 'token' });
    this.router.navigateByUrl('/auth');
  }
}
