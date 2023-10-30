// Interface to define the structure of a single Role
export interface Role {
  _id: string;
  name: 'Admin' | 'Professor' | 'Student';
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for multiple role responses
export interface MultipleRolesResponse {
  success: boolean;
  status: number;
  message: string;
  data: Role[];
}
