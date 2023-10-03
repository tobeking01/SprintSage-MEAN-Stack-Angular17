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

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}
