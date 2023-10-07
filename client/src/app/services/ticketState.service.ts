import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { apiUrls } from '../api.urls';
import {
  TicketState,
  SingleTicketStateResponseData,
  MultipleTicketStateResponseData,
} from './model/ticketState.model';

@Injectable({
  providedIn: 'root',
})
export class TicketStateService {
  private apiUrl = apiUrls.ticketStateServiceApi;

  constructor(private http: HttpClient) {}

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(error);
  }

  changeTicketState(
    ticketId: string,
    newState: string
  ): Observable<SingleTicketStateResponseData> {
    // Use the single response type here
    return this.http
      .post<SingleTicketStateResponseData>(`${this.apiUrl}changeTicketState`, {
        ticketId,
        newState,
      })
      .pipe(catchError(this.handleError));
  }

  getAllLogs(): Observable<MultipleTicketStateResponseData> {
    // multiple logs get
    return this.http
      .get<MultipleTicketStateResponseData>(`${this.apiUrl}logs`)
      .pipe(catchError(this.handleError));
  }

  getLogsForTicket(
    ticketId: string
  ): Observable<MultipleTicketStateResponseData> {
    // Multiple logs for a ticket
    return this.http
      .get<MultipleTicketStateResponseData>(
        `${this.apiUrl}logs/ticket/${ticketId}`
      )
      .pipe(catchError(this.handleError));
  }

  getLogsByUser(userId: string): Observable<MultipleTicketStateResponseData> {
    // Multiple logs by a user
    return this.http
      .get<MultipleTicketStateResponseData>(`${this.apiUrl}logs/user/${userId}`)
      .pipe(catchError(this.handleError));
  }

  deleteLog(logId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}log/${logId}`)
      .pipe(catchError(this.handleError));
  }
}
