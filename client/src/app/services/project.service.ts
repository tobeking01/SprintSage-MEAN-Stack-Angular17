import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { apiUrls } from '../api.urls';
import {
  Project,
  SingleProjectResponseData,
  projectUpdateData,
  MultipleProjectsResponseData,
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
      .post<SingleProjectResponseData>(`${this.apiUrl}project`, projectData)
      .pipe(catchError(this.handleError));
  }

  getAllProjects(): Observable<
    SingleProjectResponseData | MultipleProjectsResponseData
  > {
    return this.http
      .get<SingleProjectResponseData | MultipleProjectsResponseData>(
        `${this.apiUrl}project`
      )
      .pipe(catchError(this.handleError));
  }

  getProjectById(id: string): Observable<SingleProjectResponseData> {
    return this.http
      .get<SingleProjectResponseData>(`${this.apiUrl}getProjectById/${id}`)
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
}
