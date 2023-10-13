import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { apiUrls } from '../api.urls';
import {
  SingleTeamResponseData,
  MultipleTeamsResponseData,
  TeamPopulated,
} from './model/team.model';
import { MultipleProjectsFullResponseData } from './model/project.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = apiUrls.teamServiceApi;

  constructor(private http: HttpClient) {}

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(error);
  }

  createTeam(teamData: {
    teamName: string;
    teamMembers: string[];
  }): Observable<SingleTeamResponseData> {
    return this.http
      .post<SingleTeamResponseData>(`${this.apiUrl}createTeam`, teamData)
      .pipe(catchError(this.handleError));
  }

  getTeamsByUserId(): Observable<MultipleTeamsResponseData> {
    return this.http
      .get<MultipleTeamsResponseData>(`${this.apiUrl}getTeamsByUserId`)
      .pipe(catchError(this.handleError));
  }

  updateTeamById(
    id: string,
    teamData: TeamPopulated
  ): Observable<SingleTeamResponseData> {
    return this.http
      .put<SingleTeamResponseData>(
        `${this.apiUrl}updateTeamById/${id}`,
        teamData
      )
      .pipe(catchError(this.handleError));
  }

  deleteTeamById(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}deleteTeamById/${id}`)
      .pipe(catchError(this.handleError));
  }

  addUserToTeam(
    teamId: string,
    userId: string
  ): Observable<SingleTeamResponseData> {
    return this.http
      .post<SingleTeamResponseData>(
        `${this.apiUrl}addUserToTeam/${teamId}/${userId}`,
        {}
      )
      .pipe(catchError(this.handleError));
  }

  removeUserFromTeam(
    teamId: string,
    userId: string
  ): Observable<SingleTeamResponseData> {
    return this.http
      .post<SingleTeamResponseData>(
        `${this.apiUrl}removeUserFromTeam/${teamId}/${userId}`,
        {}
      )
      .pipe(catchError(this.handleError));
  }

  getTeamByProjectId(projectId: string): Observable<SingleTeamResponseData> {
    return this.http.get<SingleTeamResponseData>(
      `${this.apiUrl}getTeamByProjectId/${projectId}`
    );
  }

  getProjectsByTeamId(
    teamId: string
  ): Observable<MultipleProjectsFullResponseData> {
    return this.http
      .get<MultipleProjectsFullResponseData>(
        `${this.apiUrl}getProjectsByTeamId/${teamId}`
      )
      .pipe(catchError(this.handleError));
  }
}
