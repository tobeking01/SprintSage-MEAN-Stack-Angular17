import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { confirmPasswordValidator } from 'src/app/validators/confirm-password-validator';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss'],
})
export class ResetComponent implements OnInit {
  resetForm!: FormGroup;
  token!: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.resetForm = this.fb.group(
      {
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: confirmPasswordValidator('password', 'confirmPassword'),
      }
    );

    this.activatedRoute.params.subscribe((val) => {
      this.token = val['token'];
      console.log(this.token);
    });
  }

  reset(): void {
    let resetObj = {
      token: this.token,
      password: this.resetForm.value.password,
    };
    this.authService.resetPasswordService(resetObj).subscribe({
      next: (res) => {
        alert(res.message);
        this.resetForm.reset();
        this.router.navigate(['login']);
      },
      error: (err) => {
        alert(err.error.message);
      },
    });
  }
}
