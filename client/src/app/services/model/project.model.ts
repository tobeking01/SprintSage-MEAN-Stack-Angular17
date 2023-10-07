import { Team } from './team.model';
import { Ticket } from './ticket.model';

// interface for project
export interface Project {
  _id?: string;
  projectName: string;
  description?: string;
  teams: Team[];
  tickets?: Ticket[];
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface projectUpdateData {
  projectName: string;
  description?: string;
  teams: string[];
  startDate?: Date;
  endDate?: Date;
}

// For singular project responses
export interface SingleProjectResponseData {
  success: boolean;
  status: number;
  message: string;
  data: Project;
}

// For multiple project responses
export interface MultipleProjectsResponseData {
  success: boolean;
  status: number;
  message: string;
  data: Project[];
}
