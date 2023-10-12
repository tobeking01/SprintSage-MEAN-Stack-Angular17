import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/services/model/user.model';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  // This declares user as potentially a User object or null.
  // This also means you should check whether user exists before accessing its properties
  user: User | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    if (this.authService.isLoggedIn()) {
      this.userService.getLoggedInUserDetails().subscribe(
        (response: any) => {
          if (response.success) {
            if (Array.isArray(response.data) && response.data.length > 0) {
              const userData = response.data[0];

              // Convert string date from the backend to a JavaScript Date object
              if (userData.expectedGraduation) {
                userData.expectedGraduation = new Date(
                  userData.expectedGraduation
                );
              }

              // Do the same for any other date properties you may have
              if (userData.createdAt) {
                userData.createdAt = new Date(userData.createdAt);
              }
              if (userData.updatedAt) {
                userData.updatedAt = new Date(userData.updatedAt);
              }

              this.user = userData;
            } else if (response.data instanceof Object) {
              const userData = response.data as User;

              // Convert string date from the backend to a JavaScript Date object
              if (userData.expectedGraduation) {
                userData.expectedGraduation = new Date(
                  userData.expectedGraduation
                );
              }

              // Again, convert other date properties
              if (userData.createdAt) {
                userData.createdAt = new Date(userData.createdAt);
              }
              if (userData.updatedAt) {
                userData.updatedAt = new Date(userData.updatedAt);
              }

              this.user = userData;
            }
          }
        },
        (error) => {
          console.error('Error fetching user profile:', error);
          // Maybe set user to some error state, display a message, etc.
        }
      );
    }
  }

  updateProfile(): void {
    if (this.user) {
      const updates: any = {}; // The updates object should be dynamic based on role.

      if (this.user.roles.includes('Student')) {
        updates.schoolYear = this.user.schoolYear;
        updates.expectedGraduation = this.user.expectedGraduation;
      } else if (this.user.roles.includes('Professor')) {
        updates.professorTitle = this.user.professorTitle;
        updates.professorDepartment = this.user.professorDepartment;
      }

      if (this.user && this.user._id) {
        this.userService.updateProfile(this.user._id, updates).subscribe(
          (response: any) => {
            if (
              response.success &&
              Array.isArray(response.data) &&
              response.data.length > 0
            ) {
              const updatedUserData = response.data[0] as User;

              // Convert string dates from backend to Date objects (if needed).
              if (updatedUserData.expectedGraduation) {
                updatedUserData.expectedGraduation = new Date(
                  updatedUserData.expectedGraduation
                );
              }

              // Do the same for any other date properties you may have.
              if (updatedUserData.createdAt) {
                updatedUserData.createdAt = new Date(updatedUserData.createdAt);
              }
              if (updatedUserData.updatedAt) {
                updatedUserData.updatedAt = new Date(updatedUserData.updatedAt);
              }

              this.user = updatedUserData; // Update the local user object.
            }
          },
          (error) => {
            console.error('Error updating user profile:', error);
            // Display error message to user or handle the error in another way.
          }
        );
      }
    }
  }
}
