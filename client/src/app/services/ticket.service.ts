import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { apiUrls } from '../api.urls';
import {
  Ticket,
  SingleTicketResponseData,
  MultipleTicketsResponseData,
} from './model/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private apiUrl = apiUrls.ticketServiceApi;

  constructor(private http: HttpClient) {}

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(error);
  }

  createTicket(ticket: Ticket): Observable<SingleTicketResponseData> {
    return this.http
      .post<SingleTicketResponseData>(`${this.apiUrl}createTicket`, ticket)
      .pipe(catchError(this.handleError));
  }

  getAllTicketsByProjectId(
    projectId: string
  ): Observable<MultipleTicketsResponseData> {
    return this.http
      .get<MultipleTicketsResponseData>(
        `${this.apiUrl}tickets/project/${projectId}`
      )
      .pipe(catchError(this.handleError));
  }

  getTicketById(id: string): Observable<SingleTicketResponseData> {
    return this.http
      .get<SingleTicketResponseData>(`${this.apiUrl}getTicketById/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateTicketById(
    id: string,
    ticket: Ticket
  ): Observable<SingleTicketResponseData> {
    return this.http
      .put<SingleTicketResponseData>(
        `${this.apiUrl}updateTicketById/${id}`,
        ticket
      )
      .pipe(catchError(this.handleError));
  }

  deleteTicketById(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}deleteTicketById/${id}`)
      .pipe(catchError(this.handleError));
  }

  getTicketsByUserId(userId: string): Observable<MultipleTicketsResponseData> {
    return this.http
      .get<MultipleTicketsResponseData>(`${this.apiUrl}tickets/user/${userId}`)
      .pipe(catchError(this.handleError));
  }
}
