import mongoose from 'mongoose';
import { User, UserPopulated } from './user.model';
import { Project, ProjectPopulated } from './project.model';

// Interface for teams
export interface Team {
  _id?: string;
  teamName: string;

  // Adjusted to include addedDate and direct reference to user/project
  teamMembers: {
    user: User;
    addedDate?: Date; // default is managed by mongoose, but can be provided
  }[];

  projects?: {
    project: Project;
    addedDate?: Date;
  }[];

  createdBy: User;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

export interface TeamPopulated {
  _id: string;
  teamName: string;

  // Using the populated versions of User and Project
  teamMembers: {
    user: UserPopulated;
    addedDate: Date;
  }[];

  projects: {
    project: ProjectPopulated;
    addedDate: Date;
  }[];

  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

// For singular team responses
export interface SingleTeamResponseData {
  success: boolean;
  status: number;
  message: string;
  data: TeamPopulated;
}

// For multiple team responses
export interface MultipleTeamsResponseData {
  success: boolean;
  status: number;
  message: string;
  data: TeamPopulated[];
}

// This interface will represent the structure of the individual team member details
// that we expect to receive in the Angular service response.
export interface TeamMemberDetails {
  user: UserPopulated; // Populated user details
  addedDate: Date;
}

// This type will be used for the Angular service response
export type TeamMembersWithDetails = TeamMemberDetails[];
