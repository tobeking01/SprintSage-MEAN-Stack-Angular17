import mongoose from 'mongoose';
import { Ticket } from './ticket.model';
import { User } from './user.model';

// Interface for Project with only ObjectId references
export interface Project {
  _id: string;
  projectName: string;
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

export interface ProjectPopulated {
  _id: string;
  projectName: string;
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

export interface ProjectUpdateData {
  projectName: string;
  tickets?: {
    ticket: string;
    addedDate?: Date;
  }[];
  startDate?: Date;
  endDate?: Date;
  teamId?: string;
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
