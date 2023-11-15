import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketService } from 'src/app/services/ticket.service';
import { SingleTicketResponseData } from 'src/app/services/model/ticket.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/services/model/user.model';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss'],
})
export class TicketDetailsComponent implements OnInit {
  TicketDetailForm: FormGroup;
  assignedUser?: User;
  isLoading = false;
  severities = [
    { value: 'Low', viewValue: 'Low' },
    { value: 'Medium', viewValue: 'Medium' },
    { value: 'High', viewValue: 'High' },
  ];

  ticketTypes = [
    { value: 'Bug', viewValue: 'Bug' },
    { value: 'Feature Request', viewValue: 'Feature Request' },
    { value: 'Other', viewValue: 'Other' },
  ];
  @Input() ticketId?: string;
  @Input() projectId?: string;
  @Output() updateSuccess = new EventEmitter<boolean>();
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize the form here without data
    this.TicketDetailForm = this.fb.group({
      issueDescription: ['', Validators.required],
      severity: ['', Validators.required],
      assignedToUser: [''],
      ticketType: ['', Validators.required],
      projectId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const projectId = params.get('projectId');
      const ticketId = params.get('ticketId');
      if (projectId && ticketId) {
        this.projectId = projectId; // Set projectId
        this.ticketId = ticketId; // Set ticketId
        this.loadTicketData(projectId, ticketId);
      }
    });
  }

  loadTicketData(projectId: string, ticketId: string): void {
    this.isLoading = true;
    this.ticketService.getTicketById(projectId, ticketId).subscribe({
      next: (response: SingleTicketResponseData) => {
        const ticket = response.data;

        this.TicketDetailForm.patchValue({
          issueDescription: ticket.issueDescription,
          severity: ticket.severity,
          assignedToUser: ticket.assignedToUser?._id,
          ticketType: ticket.ticketType,
          projectId: ticket.projectId, // Ensure the backend sends this field
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching ticket:', error);
        this.isLoading = false;
        this.snackBar.open('Error fetching ticket data', 'Close', {
          duration: 2000,
        });
      },
    });
  }

  onSaveTicket(): void {
    if (!this.TicketDetailForm.valid) {
      this.snackBar.open('Please fill out the form correctly', 'Close', {
        duration: 2000,
      });
      return;
    }

    // Ensure ticketId is defined
    if (!this.ticketId) {
      this.snackBar.open('Ticket ID is not defined', 'Close', {
        duration: 2000,
      });
      return;
    }

    this.ticketService
      .updateTicketById(this.ticketId, this.TicketDetailForm.value)
      .subscribe({
        next: () => {
          this.snackBar.open('Ticket updated successfully', 'Close', {
            duration: 2000,
          });
          this.updateSuccess.emit(true);
          // Redirect to project-details component after successful update
          if (this.projectId) {
            this.router.navigate([`/project-details/${this.projectId}`]);
          }
        },
        error: (error) => {
          console.error('Error updating the ticket:', error);
          this.snackBar.open('Failed to update the ticket', 'Close', {
            duration: 2000,
          });
        },
      });
  }

  cancelEdit(): void {
    // Redirect to project-details component on cancel
    if (this.projectId) {
      this.router.navigate([`/project-details/${this.projectId}`]);
    } else {
      console.error('Project ID is not defined');
      this.router.navigate(['/']); // Redirect to a safe default route
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
