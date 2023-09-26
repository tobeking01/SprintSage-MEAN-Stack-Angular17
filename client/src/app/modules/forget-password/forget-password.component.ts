import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
})
export class ForgetPasswordComponent implements OnInit {
  forgetForm!: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.forgetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  forget() {
    const email = this.forgetForm.get('email')?.value;
    if (email) {
      this.authService.sendEmailService(email).subscribe({
        next: (res) => {
          alert(res.message);
          this.forgetForm.reset();
        },
        error: (err) => {
          alert(err.error.message);
        },
      });
    }
  }
}
