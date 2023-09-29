import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { apiUrls } from '../api.urls';

export interface Project {
  _id?: string;
  projectName: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = apiUrls.projectServiceApi;

  constructor(private http: HttpClient) {}

  // Function to create a new project.
  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}createProject`, project);
  }

  // Function to get all projects.
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}getAllProjects`);
  }

  // Function to get a specific project by ID.
  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}getProjectById/${id}`);
  }

  // Function to update a specific project by ID.
  updateProjectById(id: string, project: Project): Observable<Project> {
    return this.http.put<Project>(
      `${this.apiUrl}updateProjectById/${id}`,
      project
    );
  }

  // Function to delete a specific project by ID.
  deleteProjectById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}deleteProjectById/${id}`);
  }
}
