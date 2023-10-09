import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { apiUrls } from '../api.urls';
import {
  projectUpdateData,
  MultipleProjectsFullResponseData,
  SingleProjectFullResponseData,
  SingleProjectRefResponseData,
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
  }): Observable<SingleProjectRefResponseData> {
    return this.http
      .post<SingleProjectRefResponseData>(`${this.apiUrl}project`, projectData)
      .pipe(catchError(this.handleError));
  }

  getAllProjects(): Observable<
    SingleProjectFullResponseData | MultipleProjectsFullResponseData
  > {
    return this.http
      .get<SingleProjectFullResponseData | MultipleProjectsFullResponseData>(
        `${this.apiUrl}project`
      )
      .pipe(catchError(this.handleError));
  }

  getProjectById(id: string): Observable<SingleProjectFullResponseData> {
    return this.http
      .get<SingleProjectFullResponseData>(`${this.apiUrl}getProjectById/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateProjectById(
    id: string,
    updateProjectData: projectUpdateData
  ): Observable<SingleProjectRefResponseData> {
    return this.http
      .put<SingleProjectRefResponseData>(
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
