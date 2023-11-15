import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User, ResponseData } from 'src/app/services/model/user.model';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { filter, map, tap } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  roleName: string = 'Unknown Role';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    if (this.authService.isLoggedIn()) {
      this.userService
        .getUserProfile()
        .pipe(
          // Assuming `getUserProfile` will return an Observable<ResponseData>
          tap((response: ResponseData) => {
            console.log('User Roles:', response.data.roles);
            console.log(response);
          }),
          filter(
            (response: ResponseData) => response.success && !!response.data
          ),
          map((response: ResponseData) =>
            this.convertDatesForUser(response.data)
          )
        )
        .subscribe(
          (user: User) => {
            this.user = user;
            console.log('User after conversion:', this.user);
            // Fetch role name from user data
            if (this.user.roles && this.user.roles.length > 0) {
              this.roleName = this.user.roles[0] || 'Unknown Role';
              console.log('Role name:', this.roleName);
            }
            this.cd.markForCheck();
          },
          (error: any) => console.error('Error fetching user profile:', error)
        );
    }
  }

  openUpdateDialog(): void {
    if (!this.user) return;

    const dialogRef = this.dialog.open(UpdateProfileComponent, {
      width: '500px',
      data: this.user,
    });

    dialogRef
      .afterClosed()
      .subscribe((updatedData: Partial<User> | undefined) => {
        if (updatedData && this.user) {
          // Assuming _id is always present on this.user.
          const fullUpdatedData: User = {
            ...this.user,
            ...updatedData,
            _id: this.user._id,
          };
          this.user = this.convertDatesForUser(fullUpdatedData);
          this.cd.markForCheck(); // This tells Angular to re-check the component for changes
        }
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
  private convertDatesForUser(userData: User): User {
    if (userData.createdAt) userData.createdAt = new Date(userData.createdAt);
    if (userData.updatedAt) userData.updatedAt = new Date(userData.updatedAt);
    return userData;
  }
}
