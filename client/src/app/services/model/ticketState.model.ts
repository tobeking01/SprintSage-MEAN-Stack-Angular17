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
  ticketId: string; // Could be a more detailed type if you've defined one for a Ticket
  changedBy: string; // Could be a more detailed type if you've defined one for a User
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
