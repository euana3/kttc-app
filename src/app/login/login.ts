import { Component, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

// Import Auth
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loading = signal(false);
  errorMessage = signal('');

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
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { username, password } = this.loginForm.value;

    this.authService.loginWithUsername(username, password).subscribe({
      next: (res) => {
        const user = res.data.user;

        sessionStorage.setItem('userId', user.id);
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('fullname', user.fullname);
        sessionStorage.setItem('permissions', JSON.stringify(user.permissions || []));
        sessionStorage.setItem('usergroups', JSON.stringify(user.usergroups || []));

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.error ?? 'Login failed. Please try again.');
      },
    });
  }
}