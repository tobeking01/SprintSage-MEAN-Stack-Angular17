import { Component, OnInit } from '@angular/core';
// You might need to import your Team and User services and models

@Component({
  selector: 'app-team-details',
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss'],
})
export class TeamDetailsComponent implements OnInit {
  teamName: string = ''; // Placeholder until you fetch the actual data
  currentProjects: string[] = []; // Placeholder array, replace with actual data fetching
  teamMembers: { name: string }[] = []; // Placeholder array, replace with actual data fetching

  constructor() {} // Inject necessary services like TeamService, UserService, etc.

  ngOnInit(): void {
    // Initialize data fetching here
    // Fetch team details and set them to `teamName`, `currentProjects`, etc.
    // Fetch team members and set them to `teamMembers`
  }
}
