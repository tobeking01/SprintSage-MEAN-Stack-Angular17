import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TicketService } from 'src/app/services/ticket.service';
import { Ticket } from 'src/app/services/model/ticket.model';
import { TeamMemberDetails } from 'src/app/services/model/team.model';
import { TeamService } from 'src/app/services/team.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    this.teamService.getTeamMembersByProjectId(this.data.projectId).subscribe({
      next: (teamMembers) => {
        console.log('Team member in edit-ticket: ', teamMembers);
        this.teamMembers = teamMembers;
      },
      error: (error) => {
        console.error('Error fetching team members:', error);
      },
    });
  }

  onSubmit(): void {
    if (this.editTicketForm.valid && this.data.ticket && this.data.ticket._id) {
      this.ticketService
        .updateTicketById(this.data.ticket._id, this.editTicketForm.value)
        .subscribe({
          next: () => {
            this.snackBar.open('Ticket updated successfully', 'Close', {
              duration: 2000,
            });
            this.dialogRef.close('updated'); // Ensure this line is executed
          },
          error: (error) => {
            console.error('Error updating the ticket', error);
            this.snackBar.open('Failed to update the ticket', 'Close', {
              duration: 2000,
            });
          },
        });
    } else {
      console.error('Ticket ID is undefined.');
      this.snackBar.open(
        'Failed to update the ticket - Ticket ID is undefined',
        'Close',
        {
          duration: 2000,
        }
      );
    }
  }
}
