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
  providedIn: 'root'
})
export class AuthService {
  //* Creates a RXJS behaviour subject for the role authentication
  private user$ = new BehaviorSubject<User>(null);

  //* Injects the http methods for connecting to the backend
  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  //* To make sure the user is logged in before the user can be routed to the home page
  get isUserLoggedIn(): Observable<boolean> {
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        const isUserAuthenticated = user !== null;
        return of(isUserAuthenticated);
      })
    )
  }

  //* To the logged in user role for user specific functions
  get userRole(): Observable<Role> {
    return this.user$.asObservable().pipe(
      switchMap((user: User) => {
        return of(user.role);
        //? If you want to add role based authorisation you can add if else statements
        //* Return false if admin return false
        //* You can have another guard is premium return false and for user and so on 
      })
    )
  }

  //* Injects the angular http client method and router class
  constructor(private http: HttpClient, private router: Router) { }


  //* Logic to route the user when they register
  register(newUser: NewUser): Observable<User> {
    return this.http.post<User>(
      `${environment.baseApiUrl}/auth/register`, newUser, this.httpOptions
    ).pipe(take(1));
  }



    //* Logic to route the user when they login
  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${environment.baseApiUrl}/auth/login`, { email, password }, this.httpOptions
    ).pipe(
      take(1),
      tap((response: { token: string }) => {
        //* To save the json web token collected from the backend to a local storage instead of the database
        //* Using a capacitor plugin
        Storage.set({
          key: 'token',
          value: response.token
        });
        const decodedToken: userResponse = jwt_decode(response.token);
        this.user$.next(decodedToken.user)
      })
      );
  }

  isTokenInStorage(): Observable<boolean> {
    return from(Storage.get({
      key: 'token'
    })).pipe(
      map((data: { value: string } ) => {
        if (!data || !data.value) return null;

        const decodedToken: userResponse = jwt_decode(data.value);
        const jwtExpirationInMsSinceUnixEpoch = decodedToken.exp * 1000;
        const isExpired = new Date() > new Date(jwtExpirationInMsSinceUnixEpoch);

        if (isExpired) return null;
        if(decodedToken.user) {
          this.user$.next(decodedToken.user);
          return true;
        }
      })
    )
  }

  logout(): void {
    this.user$.next(null);
    Storage.remove({ key: 'token' });
    this.router.navigateByUrl('/auth');
  }
}
