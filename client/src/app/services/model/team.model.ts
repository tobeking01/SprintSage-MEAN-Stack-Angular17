import mongoose from 'mongoose';
import { User } from './user.model';
import { ProjectFull, ProjectRef } from './project.model';

// Interface for teams
export interface Team {
  _id?: string; // Optional because when creating a new team, an ID might not be present yet.
  teamName: string; // Team's name

  // An array of user IDs referencing team members
  teamMembers: (string | mongoose.Types.ObjectId)[];

  // An array of project IDs referencing associated projects
  projects?: (string | mongoose.Types.ObjectId)[];

  // Timestamps
  createdAt?: Date; // Optional because they might not always be present in every context.
  updatedAt?: Date; // Similarly optional
  __v?: number; // MongoDB document version key. Added by Mongoose by default.
}

export interface TeamPopulated {
  _id?: string;
  teamName: string;
  teamMembers: User[];
  projects?: ProjectRef[]; // Assuming you have a Project interface, you can replace this with the appropriate type
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
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
