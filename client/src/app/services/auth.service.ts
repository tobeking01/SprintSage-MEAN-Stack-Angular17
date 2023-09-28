import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { apiUrls } from '../api.urls';

interface User {
  userName: string;
  email: string;
  roles: string[];
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  isLoggedIn$ = new BehaviorSubject<boolean>(false);

  // Allow null as a value for BehaviorSubject
  private currentUserSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  currentUser$: Observable<User | null> =
    this.currentUserSubject.asObservable();

  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user); // Use the user variable, not the User type
  }
  // Add Method to get User Roles from the user object in BehaviorSubject
  getUserRoles(): string[] {
    const user = this.currentUserSubject.value;
    return user?.roles ?? [];
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

  loginService(loginObj: any) {
    return this.http.post<any>(`${apiUrls.authServiceApi}login`, loginObj);
  }

  sendEmailService(email: string) {
    return this.http.post<any>(`${apiUrls.authServiceApi}send-email`, {
      email: email,
    });
  }

  resetPasswordService(resetObj: any) {
    return this.http.post<any>(`${apiUrls.authServiceApi}reset`, resetObj);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  logout() {
    localStorage.removeItem('user_id'); // Clear user id from local storage
    this.isLoggedIn$.next(false); // Update isLoggedIn$ to false
  }
}
