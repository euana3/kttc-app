import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

//import Auth
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loading = false;
  errorMessage: string = '';

  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  // Login form submission handler
  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.authService.loginWithUsername(username, password).subscribe({
      next: (res) => {
        const user = res.data.user;
        const permission = user.permissions || [];

        if (!permission || permission.length === 0) {
          this.errorMessage =
            'Your account has no permissions to login. Please contact administrator.';
          this.loading = false;
          return;
        }

        // Store user data in session storage
        sessionStorage.setItem('userId', user.id);
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('fullname', user.fullname);
        sessionStorage.setItem('permissions', JSON.stringify(user.permissions || []));
        sessionStorage.setItem('usergroups', JSON.stringify(user.usergroups || []));

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;

        // Extract backend error message for checking the credentials
        const backendMessage = err?.error?.error;

        // 401 = unauthorized, wrong credentials
        if (err.status === 401) {
          console.error(err);
          this.errorMessage = backendMessage;
          return;
        }
        this.errorMessage = backendMessage;
      },
    });
  }
}
