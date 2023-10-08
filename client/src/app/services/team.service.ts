import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { apiUrls } from '../api.urls';
import {
  Team,
  SingleTeamResponseData,
  MultipleTeamsResponseData,
  TeamPopulated,
} from './model/team.model';

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

  addTeamMember(
    projectId: string,
    userId: string
  ): Observable<SingleTeamResponseData> {
    return this.http
      .post<SingleTeamResponseData>(`${this.apiUrl}addTeamMember`, {
        projectId,
        userId,
      })
      .pipe(catchError(this.handleError));
  }

  createTeam(teamData: {
    teamName: string;
    teamMembers: string[];
  }): Observable<SingleTeamResponseData> {
    return this.http
      .post<SingleTeamResponseData>(`${this.apiUrl}createTeam`, teamData)
      .pipe(catchError(this.handleError));
  }

  getAllTeams(): Observable<MultipleTeamsResponseData> {
    return this.http
      .get<MultipleTeamsResponseData>(`${this.apiUrl}getAllTeams`)
      .pipe(catchError(this.handleError));
  }

  getTeamById(id: string): Observable<SingleTeamResponseData> {
    return this.http
      .get<SingleTeamResponseData>(`${this.apiUrl}getTeamById/${id}`)
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

  getTeamByProjectId(projectId: string): Observable<SingleTeamResponseData> {
    return this.http.get<SingleTeamResponseData>(
      `${this.apiUrl}teamsByProject/${projectId}`
    );
  }

  getTeamsByUserId(userId: string): Observable<MultipleTeamsResponseData> {
    return this.http
      .get<MultipleTeamsResponseData>(`${this.apiUrl}teamsByUser/${userId}`)
      .pipe(catchError(this.handleError));
  }
}
