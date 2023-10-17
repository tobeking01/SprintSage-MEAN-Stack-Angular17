import mongoose from 'mongoose';
import { Team, TeamPopulated } from './team.model';
import { Ticket } from './ticket.model';
import { User } from './user.model';

// Interface for Project with only ObjectId references
export interface Project {
  _id?: string;
  projectName: string;
  description?: string;

  // Adjusted to include addedDate and direct reference to team
  teams: {
    team: string | mongoose.Types.ObjectId;
    addedDate?: Date;
  }[];

  tickets?: (string | mongoose.Types.ObjectId)[];
  createdBy: string | mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

export interface ProjectPopulated {
  _id: string;
  projectName: string;
  description?: string;

  // Using the populated version of Team
  teams: {
    team: TeamPopulated;
    addedDate: Date;
  }[];

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

  // Adjusted to match the new structure of teams in the schema
  teams: {
    team: string;
    addedDate?: Date;
  }[];

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
  teams: {
    team: string;
    addedDate?: Date;
  }[];
}
