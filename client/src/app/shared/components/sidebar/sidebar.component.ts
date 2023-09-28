import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  userName: string = 'default_user'; // default userName
  isModerator!: boolean;

  private subscription!: Subscription;
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.subscription = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.isModerator = this.authService.isAdmin();
        this.userName = user.userName; // assuming the user object has an email property
      }
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
