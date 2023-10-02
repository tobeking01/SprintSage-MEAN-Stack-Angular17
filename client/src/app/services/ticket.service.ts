import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { apiUrls } from '../api.urls';
import { Ticket } from './model/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private apiUrl = apiUrls.ticketServiceApi;

  constructor(private http: HttpClient) {}

  createTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}createTicket`, ticket);
  }

  getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}getAllTickets`);
  }

  getTicketById(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}getTicketById/${id}`);
  }

  updateTicketById(id: string, ticket: Ticket): Observable<Ticket> {
    return this.http.put<Ticket>(
      `${this.apiUrl}updateTicketById/${id}`,
      ticket
    );
  }

  deleteTicketById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}deleteTicketById/${id}`);
  }
}
