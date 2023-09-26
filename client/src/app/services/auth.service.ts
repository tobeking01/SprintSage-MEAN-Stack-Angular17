// Importing necessary modules from Angular's HTTP client module and core module.
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

// Importing the API URLs constants from a separate module.
import { apiUrls } from '../api.urls';

// Using the @Injectable decorator to make this service available to Angular's dependency injection system.
@Injectable({
  providedIn: 'root', // This ensures the AuthService is available as a singleton instance throughout the application.
})
export class AuthService {
  // Using Angular's dependency injection to get an instance of HttpClient.
  // This is used for making HTTP requests.
  constructor(private http: HttpClient) {}

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
    // Using the post method of HttpClient to make an HTTP POST request.
    // The API endpoint is constructed using a constant and appending the specific route for registration.
    return this.http.post<any>(`${apiUrls.authServiceApi}login`, loginObj);
  }

  logout() {
    // Clear user token or any user-related information from the storage
    localStorage.removeItem('userToken');
  }
}
