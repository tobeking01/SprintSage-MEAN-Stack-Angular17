import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Ticket } from 'src/app/services/model/ticket.model';
import { TicketService } from 'src/app/services/ticket.service';
import { CreateTicketComponent } from './create-ticket/create-ticket.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditTicketComponent } from './edit-ticket/edit-ticket.component';

@Component({
  selector: 'app-manage-ticket',
  templateUrl: './manage-ticket.component.html',
  styleUrls: ['./manage-ticket.component.scss'],
})
export class ManageTicketComponent implements OnInit, OnChanges, AfterViewInit {
  tickets: Ticket[] = [];
  isLoading = false;

  @Input() projectId?: string;
  displayedColumns: string[] = [
    'issueDescription',
    'severity',
    'submittedByUser',
    'assignedToUser',
    'ticketType',
    'edit',
    'delete',
  ];
  dataSource = new MatTableDataSource<Ticket>(this.tickets);

  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    this.paginator = paginator;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
  paginator!: MatPaginator;

  constructor(
    private ticketService: TicketService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tickets = [];
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']) {
      const change = changes['projectId'];
      if (change.currentValue && change.currentValue !== change.previousValue) {
        this.checkAndLoadTickets();
      }
    }
  }
  addTicket(): void {
    const dialogRef = this.dialog.open(CreateTicketComponent, {
      width: '600px',
      data: { projectId: this.projectId }, // Passing projectId to the CreateTicketComponent
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'Ticket Created') {
        this.loadTickets(); // Reload the tickets list if a new ticket was created
      }
    });
  }

  editTicket(ticket: Ticket): void {
    console.log('Ticket in editTicket: ', ticket);
    const dialogRef = this.dialog.open(EditTicketComponent, {
      width: '600px',
      data: { ticket: ticket, projectId: this.projectId }, // Pass the selected ticket for editing
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'updated') {
        this.loadTickets(); // Reload tickets
      }
    });
  }

  onRowClicked(ticket: Ticket) {
    // Open the EditTicketComponent with the clicked ticket's data
    const dialogRef = this.dialog.open(EditTicketComponent, {
      width: '600px',
      data: { ticket: ticket, projectId: this.projectId }, // Pass the selected ticket for editing
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'updated') {
        this.loadTickets(); // Reload tickets
      }
    });
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
          this.updateDataSource(); // Update the data source with the new tickets
        } else {
          // Handle the case where the structure is not as expected
          console.error('Unexpected response structure:', response);
          this.tickets = []; // Set to empty array to avoid errors
          this.updateDataSource(); // Update the data source with an empty array
        }
        this.isLoading = false; // Set isLoading to false after handling the response
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('There was an error fetching the tickets', error);
        this.tickets = []; // Set to empty array to avoid UI errors
        this.updateDataSource(); // Update the data source with an empty array
        this.isLoading = false; // Set isLoading to false even when there's an error
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // called after loading tickets
  private updateDataSource() {
    this.dataSource.data = this.tickets;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  deleteTicket(event: MouseEvent, ticketId: string): void {
    // Prevent the click from triggering the row click event
    event.stopPropagation();

    // Open a confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this ticket?',
      },
    });

    // After the dialog is closed, check if the action was confirmed
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        // Call the service to delete the ticket
        this.ticketService.deleteTicketById(ticketId).subscribe(
          () => {
            // Remove the ticket from the local array to update the UI instantly
            this.tickets = this.tickets.filter(
              (ticket) => ticket._id !== ticketId
            );
            this.dataSource.data = this.tickets;
            // Optionally show a snackbar notification
            this.snackBar.open('Ticket deleted successfully', 'Close', {
              duration: 2000,
            });
          },
          (error) => {
            // Handle error case
            console.error('Error deleting the ticket:', error);
            // Optionally show a snackbar notification for the error
            this.snackBar.open('Failed to delete the ticket', 'Close', {
              duration: 2000,
            });
          }
        );
      }
    });
  }
}
