import { Ticket } from './ticket.model';
import { Team } from './team.model';

export interface Project {
  _id?: string;
  projectName: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  teams?: Team[];
  tickets?: Ticket[];
}
