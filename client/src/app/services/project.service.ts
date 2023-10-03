import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from './model/ticket.model';
import { apiUrls } from '../api.urls';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = apiUrls.projectServiceApi;

  constructor(private http: HttpClient) {}

  createProject(project: Project): Observable<Project> {
    console.log('Payload in createProject Service:', project);
    return this.http.post<Project>(`${this.apiUrl}createProject`, project);
  }

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}getAllProjects`);
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}getProjectById/${id}`);
  }

  updateProjectById(id: string, project: Project): Observable<Project> {
    return this.http.put<Project>(
      `${this.apiUrl}updateProjectById/${id}`,
      project
    );
  }

  deleteProjectById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}deleteProjectById/${id}`);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${apiUrls.userServiceApi}getUsers`);
  }

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${apiUrls.teamServiceApi}getTeams`);
  }

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${apiUrls.ticketServiceApi}getTickets`);
  }
}
