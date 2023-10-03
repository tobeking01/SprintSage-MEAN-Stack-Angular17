// interface for project
export interface Project {
  _id?: string; // Optional for new project creation
  projectName: string; // Project's name
  description?: string; // Project's description, which can be optional
  teams: string[]; // Array of team IDs associated with the project
  tickets: string[]; // Array of ticket IDs associated with the project
  startDate?: Date; // Optional start date
  endDate?: Date; // Optional end date

  // Timestamps
  createdAt?: Date; // Optional timestamp for when the project was created
  updatedAt?: Date; // Optional timestamp for when the project was last updated
}
