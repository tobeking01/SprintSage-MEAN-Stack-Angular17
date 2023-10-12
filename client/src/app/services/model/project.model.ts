import mongoose from 'mongoose';
import { Team, TeamPopulated } from './team.model';
import { Ticket } from './ticket.model';

// Interface for Project with only ObjectId references
export interface ProjectRef {
  _id?: string;
  projectName: string;
  description?: string;
  teams: (string | mongoose.Types.ObjectId)[];
  tickets?: (string | mongoose.Types.ObjectId)[];
  createdBy: string | mongoose.Types.ObjectId; // User who created the project
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Project with full Team and Ticket objects populated
export interface ProjectFull {
  _id?: string;
  projectName: string;
  description?: string;
  teams: TeamPopulated[];
  tickets?: Ticket[];
  createdBy: string | mongoose.Types.ObjectId; // User who created the project
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface projectUpdateData {
  projectName: string;
  description?: string;
  teams: string[];
  tickets?: string[];
  startDate?: Date;
  endDate?: Date;
}

// For singular project responses with references
export interface SingleProjectRefResponseData {
  success: boolean;
  status: number;
  message: string;
  data: ProjectRef;
}

// For singular project responses with full details
export interface SingleProjectFullResponseData {
  success: boolean;
  status: number;
  message: string;
  data: ProjectFull;
}

// For multiple project responses with references
export interface MultipleProjectsRefResponseData {
  success: boolean;
  status: number;
  message: string;
  data: ProjectRef[];
}

// For multiple project responses with full details
export interface MultipleProjectsFullResponseData {
  success: boolean;
  status: number;
  message: string;
  data: ProjectFull[];
}

export interface projectAddTeamsData {
  teams: string[];
}
