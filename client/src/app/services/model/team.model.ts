import { Project } from './project.model';
import { User } from './user.model';

// interface for teams
export interface Team {
  _id?: string; // Optional because when creating a new team, an ID might not be present yet.
  teamName: string; // Team's name
  teamMembers: User[]; // An array of user IDs referencing team members
  projects?: Project[];
  // Timestamps
  createdAt?: Date; // Optional because they might not always be present in every context.
  updatedAt?: Date; // Similarly optional
  __v?: number;
}

// For singular team responses
export interface SingleTeamResponseData {
  success: boolean;
  status: number;
  message: string;
  data: Team;
}

// For multiple team responses
export interface MultipleTeamsResponseData {
  success: boolean;
  status: number;
  message: string;
  data: Team[];
}
