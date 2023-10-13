// Interface to define the structure of User
export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  roles: string[]; // This will store Role IDs.

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

export interface ResponseData {
  success: boolean;
  status: number;
  message: string;
  data: User[];
}
