import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isProfessor: boolean = false; // Store the state here
  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.isProfessor = this.authService.isProfessor();
  }

  toggleSidebar() {
    this.toggleSideBarForMe.emit();
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }

  onLogout() {
    this.authService.logout().subscribe(
      () => {
        // Handle successful logout
        this.router.navigate(['/login']); // Navigate to login page
      },
      (error) => {
        // Handle error during logout.
        console.error('Error during logout:', error);
        // Navigate to the login page.
        this.router.navigate(['/login']);
      }
    );
  }
}
