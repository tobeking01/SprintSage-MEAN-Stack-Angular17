import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();
  constructor(private authService: AuthService, private router: Router) {} // Inject AuthService and Router
  ngOnInit() {}
  toggleSidebar() {
    this.toggleSideBarForMe.emit();
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }
  onLogout() {
    this.authService.logout(); // Call the logout method from AuthService
    this.router.navigate(['/login']); // Navigate to login page
  }
}
