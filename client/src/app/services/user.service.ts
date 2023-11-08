import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ResponseData, User } from './model/user.model';
import { catchError, map } from 'rxjs/operators';

import { apiUrls } from '../api.urls';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = apiUrls.userServiceApi;

  constructor(private http: HttpClient) {}

  createUser(user: User): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}createUser`, user)
      .pipe(catchError(this.handleError));
  }

  getUserProfile(): Observable<ResponseData> {
    return this.http
      .get<ResponseData>(`${this.apiUrl}getUserProfile`)
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

  getUsersForTeam(createdBy: string): Observable<User[]> {
    console.log('Created by:', createdBy);
    const params = createdBy
      ? new HttpParams().set('createdBy', createdBy)
      : new HttpParams();
    return this.http
      .get<User[]>(`${this.apiUrl}getUsersForTeam`, { params })
      .pipe(catchError(this.handleError));
  }

  getUserId(): Observable<string> {
    // Call the backend API endpoint to get the user profile
    return this.http.get<ResponseData>(`${this.apiUrl}user/profile`).pipe(
      map((response) => {
        // Check if the backend response has an '_id' property within 'data'
        if (response && response.data && response.data._id) {
          return response.data._id; // Access the _id property
        } else {
          throw new Error('User ID not found in response data');
        }
      }),
      catchError(this.handleError) // Use an existing error handling method
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(error.message || 'Unknown server error in user service');
  }
}
