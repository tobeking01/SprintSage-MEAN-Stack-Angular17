import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { apiUrls } from '../api.urls';
import { MultipleRolesResponse, Role } from './model/role.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrl = apiUrls.roleServiceApi;

  constructor(private http: HttpClient) {}

  // Method to retrieve all roles.
  getAllRoles(): Observable<MultipleRolesResponse> {
    return this.http
      .get<MultipleRolesResponse>(`${this.apiUrl}getAllRoles`)
      .pipe(catchError(this.handleError));
  }

  // Method to update a role by its ID.
  updateRoleById(id: string, name: string): Observable<Role> {
    return this.http
      .put<Role>(`${this.apiUrl}updateRoleById/${id}`, { name })
      .pipe(catchError(this.handleError));
  }

  // Method to delete a role by its ID.
  deleteRoleById(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}deleteRoleById/${id}`)
      .pipe(catchError(this.handleError));
  }
  // Method to retrieve a role's name by its ID.
  getRoleNameById(roleId: string): Observable<string> {
    return this.http
      .get<{ name: string }>(`${this.apiUrl}getRoleNameById/${roleId}/name`)
      .pipe(
        map((response) => response.name),
        catchError((error) => {
          console.error('Error fetching role name:', error);
          return of('Unknown Role'); // This will return 'Unknown Role' in case of an error
        })
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(error);
  }
}
