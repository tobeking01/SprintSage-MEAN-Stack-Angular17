import mongoose from 'mongoose';
import { User } from './user.model';

export enum TicketSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum TicketType {
  BUG = 'Bug',
  FEATURE_REQUEST = 'Feature Request',
  OTHER = 'Other',
}

export enum TicketState {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  READY_FOR_QC = 'Ready for QC',
  IN_QC = 'In QC',
  COMPLETED = 'Completed',
  IN_BACKLOG = 'In Backlog',
}

export interface Ticket {
  _id?: string;
  issueDescription: string;
  severity: TicketSeverity;
  submittedByUser: User; // Assuming it's an ObjectId in string form.
  assignedToUser?: User; // Optional, and again assuming an ObjectId in string form.
  ticketType: TicketType;
  state?: TicketState;
  createdAt?: Date;
  updatedAt?: Date;
  projectId?: string;
}

// For singular ticket responses
export interface SingleTicketResponseData {
  success: boolean;
  status: number;
  message: string;
  data: Ticket;
}

// For multiple ticket responses
export interface MultipleTicketsResponseData {
  success: boolean;
  status: number;
  message: string;
  data: {
    tickets: Ticket[]; // Adjust the interface to reflect the actual structure
  };
}
