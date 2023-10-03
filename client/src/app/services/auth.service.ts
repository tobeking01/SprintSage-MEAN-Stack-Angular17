import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { apiUrls } from '../api.urls';
import { User } from './model/user.model';

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

  // Loads user from session storage. It’s here for if in any case, needed
  private loadUserFromStorage(): void {
    const user = sessionStorage.getItem(USER_KEY);
    if (user) this.currentUserSubject.next(JSON.parse(user));
  }

  // Call login service
  loginService(loginObj: any): Observable<any> {
    return this.http.post<any>(`${apiUrls.authServiceApi}login`, loginObj).pipe(
      tap((response) => {
        const user = response.data;
        if (user) {
          this.currentUserSubject.next(user);
          this.isLoggedIn$.next(true);
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

  // Logout user by calling the logout endpoint to invalidate the JWT token
  logout(): void {
    this.http.post(`${apiUrls.authServiceApi}logout`, {}).subscribe(
      () => {
        this.currentUserSubject.next(null);
        this.isLoggedIn$.next(false);
      },
      (error) => {
        // handle error, maybe log the user out locally anyway
        console.error('Logout error', error);
        this.currentUserSubject.next(null);
        this.isLoggedIn$.next(false);
      }
    );
  }

  // Set current user
  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    this.isLoggedIn$.next(!!user);
  }

  // Get User Roles
  getUserRoles(): string[] {
    return this.currentUserSubject.value?.roles || [];
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  // Check if user is Admin
  isAdmin(): boolean {
    return this.currentUserSubject.value?.roles.includes('Admin') || false;
  }

  // Call register service
  registerService(registerObj: any): Observable<any> {
    return this.http
      .post<any>(`${apiUrls.authServiceApi}register`, registerObj)
      .pipe(
        tap((response) => {
          if (!response.success) throw new Error('Registration Failed');
        }),
        catchError((error) => throwError(error))
      );
  }

  // Call send email service
  sendEmailService(email: string): Observable<any> {
    return this.http.post<any>(`${apiUrls.authServiceApi}send-email`, {
      email,
    });
  }

  // Call reset password service
  resetPasswordService(resetObj: any): Observable<any> {
    return this.http.post<any>(`${apiUrls.authServiceApi}reset`, resetObj);
  }
}

// auth.service.ts
export { User } from './model/user.model';
