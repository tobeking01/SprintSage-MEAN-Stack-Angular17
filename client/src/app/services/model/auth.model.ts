/**
 * A base interface that represents the shared user attributes.
 */
export interface BaseUserPayload {
  firstName: string; // User's first name
  lastName: string; // User's last name
  userName: string; // Username chosen by the user
  email: string; // User's email address
  password: string; // User's password
  role: 'Student' | 'Professor'; // Role of the user
}

/**
 * Attributes specific to a student.
 */
interface StudentSpecific {
  schoolYear: string; // Current school year of the student
  expectedGraduation: Date; // Expected graduation date for the student
}

/**
 * Attributes specific to a professor.
 */
interface ProfessorSpecific {
  professorTitle: string; // Title of the professor (e.g., Dr.)
  professorDepartment: string; // Department where the professor works
}

export type RegisterStudentPayload = BaseUserPayload & StudentSpecific;
export type RegisterProfessorPayload = BaseUserPayload & ProfessorSpecific;

/**
 * Payload for the login service.
 */
export interface LoginPayload {
  userName: string; // Username of the user
  password: string; // Password for authentication
}

// Define the ResponseData type
export interface ResponseData {
  success: boolean;
  data?: any;
  error?: string;
}
