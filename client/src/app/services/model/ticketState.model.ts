import mongoose from 'mongoose';
import { User } from './user.model';
import { Ticket } from './ticket.model';

// Enum for TicketState Action
export enum TicketStateAction {
  STATUS_CHANGE = 'STATUS_CHANGE',
  CREATION = 'CREATION',
  DELETION = 'DELETION',
  UPDATE = 'UPDATE',
}

export interface TicketState {
  _id?: string;
  action: TicketStateAction;
  ticketId: Ticket;
  changedBy: User;
  oldValue?: string; // Default: 'N/A' in schema so it can be optional
  newValue?: string; // Default: 'N/A' in schema so it can be optional
  timestamp?: Date; // Default: current timestamp in schema so it can be optional
}

// For singular ticket state responses
export interface SingleTicketStateResponseData {
  success: boolean;
  status: number;
  message: string;
  data: TicketState;
}

// For multiple ticket state responses
export interface MultipleTicketStateResponseData {
  success: boolean;
  status: number;
  message: string;
  data: TicketState[];
}
