import { HttpClient } from '@angular/common/http';
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

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$: Observable<User | null> =
    this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
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
            // Handle Unauthorized, maybe redirect to the login page
            console.warn('Unauthorized access attempt detected.');
          }
          return throwError(error);
        })
      );
  }

  logout(): void {
    console.debug('Attempting to logout...');
    this.http.post(`${apiUrls.authServiceApi}logout`, {}).subscribe(
      () => {
        this.currentUserSubject.next(null);
        this.isLoggedIn$.next(false);
        sessionStorage.removeItem(USER_KEY); // Remove user data from storage
        console.debug('User successfully logged out.');
      },
      (error) => {
        console.error('Logout error', error);
        this.currentUserSubject.next(null);
        this.isLoggedIn$.next(false);
        sessionStorage.removeItem(USER_KEY); // Remove user data from storage
      }
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

  setCurrentUser(user: User | null): void {
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

  sendEmailService(email: string): Observable<any> {
    return this.http.post<any>(`${apiUrls.authServiceApi}send-email`, {
      email,
    });
  }

  resetPasswordService(resetObj: any): Observable<any> {
    return this.http.post<any>(`${apiUrls.authServiceApi}reset`, resetObj);
  }
}
