import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { apiUrls } from '../api.urls';
import { User } from './model/user.model';
import {
  BaseUserPayload,
  LoginPayload,
  RegisterProfessorPayload,
  RegisterStudentPayload,
  ResponseData,
} from './model/auth.model';
import { Router } from '@angular/router';

const USER_KEY = 'session-auth-user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$: Observable<User | null> =
    this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  getCurrentUserId(): string | null {
    return this.currentUserValue?._id || null;
  }

  private loadUserFromStorage(): void {
    const user = sessionStorage.getItem(USER_KEY);
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
      console.debug('User loaded from storage:', user);
    }
  }

  loginService(loginObj: LoginPayload): Observable<ResponseData> {
    console.debug('Attempting to login with:', loginObj);
    return this.http
      .post<ResponseData>(`${apiUrls.authServiceApi}login`, loginObj)
      .pipe(
        tap((response) => {
          if (response.data) {
            const user = response.data;
            this.currentUserSubject.next(user);
            this.isLoggedIn$.next(true);
            sessionStorage.setItem(USER_KEY, JSON.stringify(user));
            console.debug('User successfully logged in:', user);
          } else {
            console.error('User data is not available from login response.');
            throw new Error('User data is not available');
          }
        }),

        catchError((error) => {
          console.error('Error during login:', error);
          if (error.status === 401) {
            // Handle Unauthorized, redirect to the NotFoundComponent
            this.router.navigate(['/404']);
            console.warn('Unauthorized access attempt detected.');
          }
          return throwError(error);
        })
      );
  }

  logout(): Observable<any> {
    console.debug('Attempting to logout...');
    return this.http
      .post(
        `${apiUrls.authServiceApi}logout`,
        {},
        { headers: this.getHeaders() }
      )
      .pipe(
        tap(() => {
          this.currentUserSubject.next(null);
          this.isLoggedIn$.next(false);
          sessionStorage.removeItem(USER_KEY);
          console.debug('User successfully logged out.');
        }),

        catchError((error) => {
          console.error('Logout error', error);
          this.currentUserSubject.next(null);
          this.isLoggedIn$.next(false);
          localStorage.removeItem(USER_KEY);
          throw error;
        })
      );
  }

  registerStudentService(
    registerObj: RegisterStudentPayload
  ): Observable<ResponseData> {
    console.debug('Attempting to register student with:', registerObj);
    return this.handleRegistration(registerObj, 'student');
  }

  registerProfessorService(
    registerObj: RegisterProfessorPayload
  ): Observable<ResponseData> {
    console.debug('Attempting to register professor with:', registerObj);
    return this.handleRegistration(registerObj, 'professor');
  }

  private handleRegistration(
    registerObj: BaseUserPayload,
    type: 'student' | 'professor'
  ): Observable<ResponseData> {
    console.debug(`Handling registration for type: ${type}`, registerObj);
    return this.http
      .post<ResponseData>(`${apiUrls.authServiceApi}register`, registerObj)
      .pipe(
        tap((response) => {
          if (!response.success) {
            console.error('Registration failed with response:', response);
            throw new Error('Registration Failed');
          }
          console.debug('Registration successful for:', registerObj);
        }),
        catchError((error) => {
          console.error('Error during registration:', error);
          return throwError(error);
        })
      );
  }

  private getHeaders(): HttpHeaders {
    const user = this.currentUserValue;
    if (user && user.token) {
      return new HttpHeaders({ Authorization: 'Bearer ' + user.token });
    } else {
      return new HttpHeaders();
    }
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.isLoggedIn$.next(!!user);
  }

  getUserRoles(): string[] {
    return this.currentUserSubject.value?.roles || [];
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.roles.includes('Admin') || false;
  }

  isProfessor(): boolean {
    return this.currentUserSubject.value?.roles.includes('Professor') || false;
  }

  sendEmailService(email: string): Observable<any> {
    return this.http.post<any>(`${apiUrls.authServiceApi}send-email`, {
      email,
    });
  }

  resetPasswordService(resetObj: any): Observable<any> {
    return this.http.post<any>(`${apiUrls.authServiceApi}reset`, resetObj);
  }
}
