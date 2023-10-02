export interface Team {
  _id?: string;
  teamName: string;
  teamMembers: string[]; // assuming that the teamMembers array holds IDs of the users
  projects: string[]; // assuming that the projects array holds IDs of the projects
}
