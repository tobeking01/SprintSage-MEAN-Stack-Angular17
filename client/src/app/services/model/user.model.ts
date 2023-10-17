import { Role } from './role.model';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  roles: string[]; // This represents the Role IDs.

  // New fields for teams and projects
  teams: {
    team: string;
    addedDate?: Date;
  }[];

  projects: {
    project: string;
    addedDate?: Date;
  }[];

  // Student-specific fields
  schoolYear?: string;
  expectedGraduation?: Date;

  // Professor-specific fields
  professorTitle?: string;
  professorDepartment?: string;

  token?: string;
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

// Populated version of User with full Role objects
export interface UserPopulated extends Omit<User, 'roles'> {
  roles: Role[];
}

export interface ResponseData {
  success: boolean;
  status: number;
  message: string;
  data: User[];
}
