import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../auth/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private socket: Socket, private http: HttpClient) {}

  sendMessage(message: string): void {
    this.socket.emit('sendMessage', message);
  }

  getNewMessage(): Observable<string> {
    return this.socket.fromEvent<string>('newMessage');
  }

  getFriends(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.baseApiUrl}/user/friends/my`);
  }
}
