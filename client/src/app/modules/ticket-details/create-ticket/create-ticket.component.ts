import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TeamMemberDetails } from 'src/app/services/model/team.model';
import { TeamService } from 'src/app/services/team.service';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.component.html',
  styleUrls: ['./create-ticket.component.scss'],
})
export class CreateTicketComponent {
  ticketForm: FormGroup;
  teamMembers: TeamMemberDetails[] = [];
  severities = [
    { value: 'low', viewValue: 'Low' },
    { value: 'medium', viewValue: 'Medium' },
    { value: 'high', viewValue: 'High' },
  ];
  ticketTypes = [
    { value: 'bug', viewValue: 'Bug' },
    { value: 'feature', viewValue: 'Feature Request' },
    { value: 'other', viewValue: 'Other' },
  ];

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private teamService: TeamService,

    private dialogRef: MatDialogRef<CreateTicketComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: string }
  ) {
    this.ticketForm = this.fb.group({
      issueDescription: ['', Validators.required],
      severity: ['', Validators.required],
      assignedToUser: [''], // Assuming it's optional; add Validators.required if it's not
      ticketType: ['', Validators.required],
      projectId: [this.data.projectId, Validators.required], // Store the projectId in the form
    });
  }

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  // Component method to load team members
  loadTeamMembers(): void {
    this.teamService.getTeamMembersByProjectId(this.data.projectId).subscribe({
      next: (teamMembers) => {
        // Assuming this.teamMembers is the property in your component where you store the team members
        this.teamMembers = teamMembers;
      },
      error: (error) => {
        console.error('Error fetching team members:', error);
      },
    });
  }

  onSubmit(): void {
    if (this.ticketForm.valid) {
      this.ticketService.createTicket(this.ticketForm.value).subscribe({
        next: (response) => {
          // Handle the response, such as closing the dialog and returning the result
          this.dialogRef.close(response);
        },
        error: (error) => {
          // Handle errors
          console.error('There was an error creating the ticket', error);
        },
      });
    }
  }
}
