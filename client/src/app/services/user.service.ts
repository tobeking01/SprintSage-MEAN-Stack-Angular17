import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseData, User } from './model/user.model';

import { apiUrls } from '../api.urls';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = apiUrls.userServiceApi;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<ResponseData> {
    console.log(`Fetching users from URL in User: ${this.apiUrl}getAllUsers`);
    return this.http.get<ResponseData>(`${this.apiUrl}getAllUsers`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}getUserById/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}createUser`, user);
  }

  updateUser(id: string, updates: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}updateUser/${id}`, updates);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/deleteUser/${id}`
    );
  }
}
