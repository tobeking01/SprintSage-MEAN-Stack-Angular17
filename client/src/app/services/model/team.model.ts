export interface Team {
  _id?: string;
  teamName: string;
  teamMembers: string[]; // Array of User IDs
  projects: string[]; // Array of Project IDs
}
