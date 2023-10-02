import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { apiUrls } from '../api.urls';
import { Team } from './model/team.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = apiUrls.teamServiceApi;

  constructor(private http: HttpClient) {}

  // Methods with updated URLs
  addTeamMember(projectId: string, userId: string): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}addTeamMember`, {
      projectId,
      userId,
    });
  }
  // Method to create a new team.
  createTeam(teamData: any): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}createTeam`, teamData);
  }
  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}getAllTeams`);
  }

  getTeamById(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}getTeamById/${id}`);
  }

  updateTeamById(id: string, teamData: Team): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}updateTeamById/${id}`, teamData);
  }

  deleteTeamById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}deleteTeamById/${id}`);
  }
}
