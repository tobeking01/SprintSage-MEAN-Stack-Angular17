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
        console.log(teamMembers); // Add this line to log the response
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
        next: () => {
          // Handle the response, such as closing the dialog and returning the result
          this.dialogRef.close('Ticket Created');
        },
        error: (error) => {
          // Handle errors
          console.error('There was an error creating the ticket', error);
        },
      });
    }
  }
}
