import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { ResponseData, User } from './model/user.model';

import { apiUrls } from '../api.urls';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = apiUrls.userServiceApi;
  private roleMappings: { [id: string]: string } = {};

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
  getRoleMappings(): Observable<{ [id: string]: string }> {
    if (Object.keys(this.roleMappings).length) {
      return of(this.roleMappings); // if roleMappings is already fetched
    }

    return this.http
      .get<{ [id: string]: string }>(`${this.apiUrl}role-mappings`)
      .pipe(
        tap((mappings) => {
          this.roleMappings = mappings;
          console.log('Fetched Role Mappings:', this.roleMappings); // Add this line
        })
      );
  }

  getRoleNameById(roleId: string): Observable<string> {
    return this.getRoleMappings().pipe(
      map((mappings) => {
        console.log(
          'Converting Role ID:',
          roleId,
          'to Name:',
          mappings[roleId]
        );
        return mappings[roleId] || 'Unknown Role';
      })
    );
  }
}
