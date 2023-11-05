import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Ticket } from 'src/app/services/model/ticket.model';
import { TicketService } from 'src/app/services/ticket.service';
import { CreateTicketComponent } from './create-ticket/create-ticket.component';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss'],
})
export class TicketDetailsComponent implements OnInit, OnChanges {
  tickets: Ticket[] = [];
  isLoading = false;

  @Input() projectId?: string;
  displayedColumns: string[] = [
    'issueDescription',
    'severity',
    'submittedByUser',
    'assignedToUser',
    'ticketType',
  ];

  constructor(
    private ticketService: TicketService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']) {
      const change = changes['projectId'];
      if (change.currentValue && change.currentValue !== change.previousValue) {
        this.checkAndLoadTickets();
      }
    }
  }

  private checkAndLoadTickets(): void {
    if (this.projectId?.trim()) {
      this.loadTickets();
      console.log('ProjectId in checkAndLoadTickets', this.projectId);
    } else {
      console.error('projectId is required for loading tickets.');
    }
  }

  loadTickets(): void {
    console.log('projectId in load', this.projectId);

    if (!this.projectId || this.projectId === '') {
      console.error('projectId is required for loading tickets.');
      return;
    }

    this.ticketService.getAllTicketsByProjectId(this.projectId).subscribe({
      next: (response) => {
        // Access the tickets array from the response.data.tickets property
        this.tickets = response.data.tickets; // Adjust this line to match the actual response structure
      },
      error: (error) => {
        console.error('There was an error fetching the tickets', error);
      },
    });
  }

  addTicket(): void {
    // If using a dialog:
    const dialogRef = this.dialog.open(CreateTicketComponent, {
      width: '600px',
      data: { projectId: this.projectId }, // Passing projectId to the CreateTicketComponent
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadTickets(); // Reload the tickets list if a new ticket was created
      }
    });
  }
  searchTickets() {}

  // Utility method to get the user name (assuming you have a method or property on Ticket objects)
  // If the User object is complex and nested, you may need a more complex implementation
  getUserName(userId: string): string {
    // Replace with actual logic to get the user name from the user ID
    return 'Username'; // Placeholder return
  }

  deleteTicket() {}
}
