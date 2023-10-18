import mongoose from 'mongoose';
import { Ticket } from './ticket.model';
import { User } from './user.model';
import { Team } from './team.model';

// Interface for Project with only ObjectId references
export interface Project {
  _id?: string;
  projectName: string;
  tickets?: {
    ticket: string | mongoose.Types.ObjectId;
    addedDate?: Date;
  }[];
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
  teams?: Team[];
  tickets?: {
    ticket: Ticket;
    addedDate?: Date;
  }[];
  createdBy: User;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

export interface projectUpdateData {
  projectName: string;
  tickets?: {
    ticket: string;
    addedDate?: Date;
  }[];
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
