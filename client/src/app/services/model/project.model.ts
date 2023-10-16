import mongoose from 'mongoose';
import { Team, TeamPopulated } from './team.model';
import { Ticket } from './ticket.model';
import { User } from './user.model';

// Interface for Project with only ObjectId references
export interface Project {
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
  __v?: number; // MongoDB document version key. Added by Mongoose by default.
}

export interface ProjectPopulated {
  _id: string;
  projectName: string;
  description?: string;
  teams: TeamPopulated[];
  tickets?: Ticket[];
  createdBy: User;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
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
export interface SingleProjectResponseData {
  success: boolean;
  status: number;
  message: string;
  data: ProjectPopulated;
}

// For multiple project responses with references
export interface MultipleProjectsResponseData {
  success: boolean;
  status: number;
  message: string;
  data: ProjectPopulated[];
}

export interface projectAddTeamsData {
  teams: string[];
}
