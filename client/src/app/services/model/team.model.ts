// interface for teams
export interface Team {
  _id?: string; // Optional because when creating a new team, an ID might not be present yet.
  teamName: string; // Team's name
  teamMembers: string[]; // An array of user IDs referencing team members
  projects: string[]; // An array of project IDs referencing the team's projects

  // Timestamps
  createdAt?: Date; // Optional because they might not always be present in every context.
  updatedAt?: Date; // Similarly optional
}
