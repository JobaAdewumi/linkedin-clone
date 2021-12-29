import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Post } from '../models/Post';
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http: HttpClient) { }

  getSelectedPost(params) {
    return this.http.get<Post[]>(
      `${environment.baseApiUrl}/feed${params}`);
  }
}
