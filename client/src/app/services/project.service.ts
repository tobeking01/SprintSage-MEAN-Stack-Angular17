import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { apiUrls } from '../api.urls';
import {
  MultipleProjectsResponseData,
  SingleProjectResponseData,
  projectUpdateData,
} from './model/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = apiUrls.projectServiceApi;

  constructor(private http: HttpClient) {}

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(error);
  }

  createProject(projectData: {
    projectName: string;
    description?: string;
    teams: string[];
    tickets?: string[];
    startDate?: Date;
    endDate?: Date;
  }): Observable<SingleProjectResponseData> {
    return this.http
      .post<SingleProjectResponseData>(
        `${this.apiUrl}createProject`,
        projectData
      )
      .pipe(catchError(this.handleError));
  }

  getProjectById(id: string): Observable<MultipleProjectsResponseData> {
    return this.http
      .get<MultipleProjectsResponseData>(`${this.apiUrl}getProjectById/${id}`)
      .pipe(catchError(this.handleError));
  }

  getProjectsByUserId(): Observable<MultipleProjectsResponseData> {
    return this.http
      .get<MultipleProjectsResponseData>(`${this.apiUrl}getProjectsByUserId`)
      .pipe(catchError(this.handleError));
  }

  updateProjectById(
    id: string,
    updateProjectData: projectUpdateData
  ): Observable<SingleProjectResponseData> {
    return this.http
      .put<SingleProjectResponseData>(
        `${this.apiUrl}updateProjectById/${id}`,
        updateProjectData
      )
      .pipe(catchError(this.handleError));
  }

  deleteProjectById(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}deleteProjectById/${id}`)
      .pipe(catchError(this.handleError));
  }
  addTeamsToProject(
    projectId: string,
    teamIds: string[]
  ): Observable<SingleProjectResponseData> {
    const endpointUrl = `${this.apiUrl}/${projectId}/addTeams`;
    return this.http
      .put<SingleProjectResponseData>(endpointUrl, { teams: teamIds })
      .pipe(catchError(this.handleError));
  }

  removeMemberFromProject(
    projectId: string,
    memberId: string
  ): Observable<SingleProjectResponseData> {
    const url = `${this.apiUrl}/${projectId}/members/${memberId}`;
    return this.http
      .delete<SingleProjectResponseData>(url)
      .pipe(catchError(this.handleError));
  }
}
