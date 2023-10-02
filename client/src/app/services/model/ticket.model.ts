export interface Ticket {
  _id?: string;
  issueDescription: string;
  status?: 'Open' | 'In Progress' | 'Closed';
  severity: 'Low' | 'Medium' | 'High';
  submittedBy: string;
  assignedTo?: string;
  dateAdded?: Date;
  lastModifiedDate?: Date;
  ticketType: 'Bug' | 'Feature Request' | 'Other';
}
