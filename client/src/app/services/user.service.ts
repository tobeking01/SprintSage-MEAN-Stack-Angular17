import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; // Importing tap operator from rxjs

import { apiUrls } from '../api.urls'; // Importing apiUrls

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private contentSubject = new BehaviorSubject<string | null>(null);
  public content$ = this.contentSubject.asObservable();

  constructor(private http: HttpClient) {}

  getPublicContent(): Observable<string> {
    return this.http
      .get(apiUrls.userServiceApi + 'all', { responseType: 'text' })
      .pipe(tap((content) => this.contentSubject.next(content)));
  }

  getUserBoard(): Observable<string> {
    return this.http
      .get(apiUrls.userServiceApi + 'user', { responseType: 'text' })
      .pipe(tap((content) => this.contentSubject.next(content)));
  }

  getModeratorBoard(): Observable<string> {
    return this.http
      .get(apiUrls.userServiceApi + 'mod', { responseType: 'text' })
      .pipe(tap((content) => this.contentSubject.next(content)));
  }

  getAdminBoard(): Observable<string> {
    return this.http
      .get(apiUrls.userServiceApi + 'admin', { responseType: 'text' })
      .pipe(tap((content) => this.contentSubject.next(content)));
  }
}
