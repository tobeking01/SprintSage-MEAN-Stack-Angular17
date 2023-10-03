// interface for Ticket
export interface Ticket {
  _id?: string; // Optional for new ticket creation
  issueDescription: string; // Description of the issue
  status: 'Open' | 'In Progress' | 'Closed'; // Ticket status
  severity: 'Low' | 'Medium' | 'High'; // Severity of the issue
  submittedByUser: string; // ID of the user who submitted the ticket
  assignedToUser?: string; // ID of the user assigned to the ticket (optional assignment)
  projectId: string; // ID of the associated project
  ticketType: 'Bug' | 'Feature Request' | 'Other'; // Type of ticket
  state:
    | 'New'
    | 'In Progress'
    | 'Ready for QC'
    | 'In QC'
    | 'Completed'
    | 'In Backlog'; // The state of the ticket

  // Timestamps
  createdAt?: Date; // Optional timestamp for when the ticket was created
  updatedAt?: Date; // Optional timestamp for when the ticket was last updated
}
