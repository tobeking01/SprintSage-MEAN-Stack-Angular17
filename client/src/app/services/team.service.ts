import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { apiUrls } from '../api.urls';
import {
  SingleTeamResponseData,
  MultipleTeamsResponseData,
  TeamMemberDetails,
} from './model/team.model';
import { MultipleProjectsResponseData } from './model/project.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private apiUrl = apiUrls.teamServiceApi;

  constructor(private http: HttpClient) {}

  // Used in team-details
  addUsersToTeam(
    teamId: string,
    membersPayload: { teamMembers: string[] }
  ): Observable<SingleTeamResponseData> {
    const fullUrl = `${this.apiUrl}${teamId}/add-members`;
    console.log('Making request to:', fullUrl);
    // Then make the HTTP request

    // Note the removal of the extra 'addUsersToTeam/' from the URL
    return this.http.post<SingleTeamResponseData>(
      `${this.apiUrl}${teamId}/add-members`,
      membersPayload
    );
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
    teamId: string,
    teamData: { teamName: string; teamMembers: string[] }
  ): Observable<SingleTeamResponseData> {
    return this.http
      .put<SingleTeamResponseData>(
        `${this.apiUrl}updateTeamById/${teamId}`,
        teamData
      )
      .pipe(catchError(this.handleError));
  }

  // Method to get team details by ID
  getTeamDetailsById(teamId: string): Observable<SingleTeamResponseData> {
    console.log('teamId in service', teamId);
    return this.http
      .get<SingleTeamResponseData>(`${this.apiUrl}getTeamDetailsById/${teamId}`)
      .pipe(catchError(this.handleError));
  }

  deleteTeamById(teamId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}deleteTeamById/${teamId}`)
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
        `${this.apiUrl}removeUserFromTeam/${teamId}/removeUser/${userId}`,
        {}
      )
      .pipe(catchError(this.handleError));
  }

  getProjectsByTeamId(
    teamId: string
  ): Observable<MultipleProjectsResponseData> {
    return this.http
      .get<MultipleProjectsResponseData>(
        `${this.apiUrl}getProjectsByTeamId/${teamId}`
      )
      .pipe(catchError(this.handleError));
  }

  getTeamsByProjectId(
    projectId: string
  ): Observable<MultipleTeamsResponseData> {
    return this.http
      .get<MultipleTeamsResponseData>(
        `${this.apiUrl}getTeamsByProjectId?projectId=${projectId}`
      )
      .pipe(catchError(this.handleError));
  }

  getTeamMembersByProjectId(
    projectId: string
  ): Observable<TeamMemberDetails[]> {
    return this.http
      .get<{ data: TeamMemberDetails[] }>(
        `${this.apiUrl}getTeamMembersByProjectId?projectId=${projectId}`
      )
      .pipe(
        map((response) => response.data), // Map the response to extract the data property
        catchError(this.handleError)
      );
  }

  getAllTeamsWithProjects(): Observable<MultipleTeamsResponseData> {
    return this.http
      .get<MultipleTeamsResponseData>(`${this.apiUrl}getAllTeamsWithProjects`)
      .pipe(catchError(this.handleError));
  }
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(error);
  }
}
