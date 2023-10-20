import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User, ResponseData } from 'src/app/services/model/user.model';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { UpdateProfileComponent } from './update-profile/update-profile.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  UserRole: 'Student' | 'Professor' | '' = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  private convertDatesForUser(userData: User): User {
    if (userData.createdAt) userData.createdAt = new Date(userData.createdAt);
    if (userData.updatedAt) userData.updatedAt = new Date(userData.updatedAt);
    return userData;
  }

  fetchUserProfile(): void {
    if (this.authService.isLoggedIn()) {
      this.userService.getUserProfile().subscribe(
        (response: ResponseData) => {
          console.log(response);
          if (response.success && response.data) {
            this.user = this.convertDatesForUser(response.data as User);
            console.log('User after conversion:', this.user);

            // Determine the role based on the user data.
            if (this.user.schoolYear) {
              this.UserRole = 'Student';
            } else if (this.user.professorTitle) {
              this.UserRole = 'Professor';
            } else {
              this.UserRole = '';
            }

            this.cd.detectChanges();
          }
        },
        (error) => console.error('Error fetching user profile:', error)
      );
    }
  }

  openUpdateDialog(): void {
    if (!this.user) return;
    this.dialog
      .open(UpdateProfileComponent, { width: '500px', data: this.user })
      .afterClosed()
      .subscribe((updatedData) => {
        if (updatedData) this.updateProfileWithData(updatedData);
      });
  }

  updateProfileWithData(updatedData: Partial<User>): void {
    if (!this.user || !this.user._id) return;

    this.userService.updateStudentProfile(this.user._id, updatedData).subscribe(
      (response: any) => {
        if (response.success && response.data) {
          this.user = this.convertDatesForUser(response.data as User);
          this.cd.detectChanges();
        }
      },
      (error) =>
        console.error('Error updating user profile with new data:', error)
    );
  }
}
