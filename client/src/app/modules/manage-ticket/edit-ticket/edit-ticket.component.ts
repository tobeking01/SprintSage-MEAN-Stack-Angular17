import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  NgZone,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TicketService } from 'src/app/services/ticket.service';
import { Ticket } from 'src/app/services/model/ticket.model';
import { TeamMemberDetails } from 'src/app/services/model/team.model';
import { TeamService } from 'src/app/services/team.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Observable,
  Subject,
  catchError,
  finalize,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';

@Component({
  selector: 'app-edit-ticket',
  templateUrl: './edit-ticket.component.html',
  styleUrls: ['./edit-ticket.component.scss'],
})
export class EditTicketComponent implements OnInit {
  editTicketForm: FormGroup;
  teamMembers: TeamMemberDetails[] = [];
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

  @Output() updateSuccess = new EventEmitter<boolean>();
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditTicketComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ticket: Ticket; projectId: string },
    private ticketService: TicketService,
    private teamService: TeamService,
    private snackBar: MatSnackBar
  ) {
    // Initialize the form with the data of the ticket to be edited
    this.editTicketForm = this.fb.group({
      issueDescription: [
        this.data.ticket.issueDescription,
        Validators.required,
      ],
      severity: [this.data.ticket.severity, Validators.required],
      assignedToUser: [this.data.ticket.assignedToUser?._id],
      ticketType: [this.data.ticket.ticketType, Validators.required],
      projectId: [this.data.projectId, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  // Component method to load team members
  loadTeamMembers(): void {
    this.teamService
      .getTeamMembersByProjectId(this.data.projectId)
      .pipe(takeUntil(this.destroy$)) // Add takeUntil here
      .subscribe({
        next: (teamMembers) => {
          console.log('Team member in edit-ticket: ', teamMembers);
          this.teamMembers = teamMembers;
        },
        error: (error) => {
          console.error('Error fetching team members:', error);
        },
      });
  }

  onSaveTicket(): void {
    if (
      !this.editTicketForm.valid ||
      !this.data.ticket ||
      !this.data.ticket._id
    ) {
      this.snackBar.open(
        'Ticket update failed - Invalid input or missing ticket ID',
        'Close',
        { duration: 2000 }
      );
      this.dialogRef.close('invalid');
      return;
    }

    this.ticketService
      .updateTicketById(this.data.ticket._id, this.editTicketForm.value)
      .subscribe({
        next: () => {
          this.snackBar.open('Ticket updated successfully', 'Close', {
            duration: 2000,
          });
          this.dialogRef.close('updated');
        },
        error: (error) => {
          console.error('Error updating the ticket', error);
          this.snackBar.open('Failed to update the ticket', 'Close', {
            duration: 2000,
          });
          this.dialogRef.close('error');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
