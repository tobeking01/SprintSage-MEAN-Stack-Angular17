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
    'delete',
  ];

  constructor(
    private ticketService: TicketService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.tickets = [];
  }

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
    if (!this.projectId || this.projectId === '') {
      console.error('projectId is required for loading tickets.');
      return;
    }

    this.isLoading = true; // Set isLoading to true when the loading process starts

    this.ticketService.getAllTicketsByProjectId(this.projectId).subscribe({
      next: (response) => {
        console.log('response in load', response);
        // Check if the response is structured as expected
        if (response && response.data && Array.isArray(response.data.tickets)) {
          this.tickets = response.data.tickets;
        } else {
          // Handle the case where the structure is not as expected
          console.error('Unexpected response structure:', response);
          this.tickets = []; // Set to empty array to avoid errors
        }
        this.isLoading = false; // Set isLoading to false after handling the response
      },
      error: (error) => {
        console.error('There was an error fetching the tickets', error);
        this.isLoading = false; // Set isLoading to false even when there's an error
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

  deleteTicket(event: MouseEvent, teamId: string): void {}
}
