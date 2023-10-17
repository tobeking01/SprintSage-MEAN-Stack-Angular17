import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap, throwError } from 'rxjs';
import { ResponseData, User } from './model/user.model';
import { catchError } from 'rxjs/operators';

import { apiUrls } from '../api.urls';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = apiUrls.userServiceApi;
  private roleMappings: { [id: string]: string } = {};

  constructor(private http: HttpClient, private authService: AuthService) {}

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error); // Log to console instead
    return throwError(error.message || 'Unknown server error in user service');
  }

  getLoggedInUserId(): string | null {
    return this.authService.getCurrentUserId();
  }

  getLoggedInUserDetails(): Observable<ResponseData> {
    return this.http
      .get<ResponseData>(`${this.apiUrl}getLoggedInUserDetails`)
      .pipe(catchError(this.handleError));
  }

  createUser(user: User): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}createUser`, user)
      .pipe(catchError(this.handleError));
  }

  updateStudentProfile(
    id: string,
    updates: Partial<User>
  ): Observable<ResponseData> {
    return this.http
      .put<ResponseData>(`${this.apiUrl}updateStudentProfile/${id}`, updates)
      .pipe(catchError(this.handleError));
  }

  updateProfessorProfile(
    id: string,
    updates: Partial<User>
  ): Observable<ResponseData> {
    return this.http
      .put<ResponseData>(`${this.apiUrl}updateProfessorProfile/${id}`, updates)
      .pipe(catchError(this.handleError));
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}deleteUser/${id}`)
      .pipe(catchError(this.handleError));
  }

  getAllUsersForTeam(): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.apiUrl}getUsersForTeam`)
      .pipe(catchError(this.handleError));
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