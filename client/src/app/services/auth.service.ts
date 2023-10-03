import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { apiUrls } from '../api.urls';
import { User } from './model/user.model';
import {
  LoginPayload,
  RegisterProfessorPayload,
  RegisterStudentPayload,
} from './model/auth.model';

// Constant to manage the user key in session storage
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const user = sessionStorage.getItem(USER_KEY);
    if (user) this.currentUserSubject.next(JSON.parse(user));
  }

  loginService(loginObj: LoginPayload): Observable<ResponseData> {
    return this.http
      .post<ResponseData>(`${apiUrls.authServiceApi}login`, loginObj)
      .pipe(
        tap((response) => {
          const user = response.data;
          if (user) {
            this.currentUserSubject.next(user);
            this.isLoggedIn$.next(true);
            sessionStorage.setItem(USER_KEY, JSON.stringify(user));
          } else {
            throw new Error('User data is not available');
          }
        }),
        catchError((error) => {
          if (error.status === 401) {
            // Handle Unauthorized, maybe redirect to login page
          }
          return throwError(error);
        })
      );
  }

  logout(): void {
    this.http.post(`${apiUrls.authServiceApi}logout`, {}).subscribe(
      () => {
        this.currentUserSubject.next(null);
        this.isLoggedIn$.next(false);
      },
      (error) => {
        console.error('Logout error', error);
        this.currentUserSubject.next(null);
        this.isLoggedIn$.next(false);
      }
    );
  }

  registerStudentService(
    registerObj: RegisterStudentPayload
  ): Observable<ResponseData> {
    return this.handleRegistration(registerObj);
  }

  registerProfessorService(
    registerObj: RegisterProfessorPayload
  ): Observable<ResponseData> {
    return this.handleRegistration(registerObj);
  }

  private handleRegistration(
    registerObj: BaseUserPayload
  ): Observable<ResponseData> {
    return this.http
      .post<ResponseData>(`${apiUrls.authServiceApi}register`, registerObj)
      .pipe(
        tap((response) => {
          if (!response.success) {
            throw new Error('Registration Failed');
          }
        }),
        catchError((error) => throwError(error))
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
