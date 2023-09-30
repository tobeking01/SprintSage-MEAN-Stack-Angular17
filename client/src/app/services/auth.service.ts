import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { apiUrls } from '../api.urls';
const USER_KEY = 'auth-user';

export interface User {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn$: BehaviorSubject<boolean>;

  constructor(private http: HttpClient) {
    this.isLoggedIn$ = new BehaviorSubject<boolean>(false); // Initialize as false by default
    this.loadUserFromStorage();
  }

  private currentUserSubject = new BehaviorSubject<User | null>(
    this.loadUserFromStorage()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  private loadUserFromStorage(): User | null {
    const user = sessionStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  loginService(loginObj: any) {
    return this.http.post<any>(`${apiUrls.authServiceApi}login`, loginObj).pipe(
      tap((response) => {
        const user = response.data; // extract user object from data property of the response
        if (user) {
          sessionStorage.setItem(USER_KEY, JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.isLoggedIn$.next(true);
        } else {
          console.error('User data is not available in the response');
          throw new Error('User data is not available');
        }
      })
    );
  }

  logout() {
    sessionStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
    this.isLoggedIn$.next(false);
  }

  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    if (user) {
      this.isLoggedIn$.next(true);
    }
  }

  getUserRoles(): string[] {
    const user = this.currentUserSubject.value;
    console.log('Current User in AuthService:', user);

    return user?.roles ?? [];
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
  // Update isAdmin method
  isAdmin(): boolean {
    const user: User | null = this.currentUserSubject.value;
    return user?.roles?.includes('admin') ?? false;
  }

  /**
   * Function to call the registration API.
   *
   * @param registerObj - The object containing user registration details.
   * @returns An Observable of the HTTP response from the API.
   */
  registerService(registerObj: any) {
    // Using the post method of HttpClient to make an HTTP POST request.
    // The API endpoint is constructed using a constant and appending the specific route for registration.
    return this.http.post<any>(
      `${apiUrls.authServiceApi}register`,
      registerObj
    );
  }

  sendEmailService(email: string) {
    return this.http.post<any>(`${apiUrls.authServiceApi}send-email`, {
      email: email,
    });
  }

  resetPasswordService(resetObj: any) {
    return this.http.post<any>(`${apiUrls.authServiceApi}reset`, resetObj);
  }
}
