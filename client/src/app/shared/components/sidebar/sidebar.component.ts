import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  userName$: Observable<string>;
  isUserLoggedIn$: Observable<boolean>;

  constructor(private authService: AuthService) {
    this.userName$ = this.authService.currentUser$.pipe(
      map((user) => (user ? user.userName : 'default_user'))
    );
    this.isUserLoggedIn$ = this.authService.currentUser$.pipe(
      map((user) => !!user)
    );
  }
}
