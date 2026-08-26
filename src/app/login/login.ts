import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  loading = false;
  errorMessage = '';

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {

    // Mark fields as touched so validation messages appear
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      this.errorMessage = 'Please fill in all required fields.';

      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const username = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;

    // Temporary login logic
    if (username === password) {

      this.loading = false;

      this.router.navigate(['/dashboard']);

    } else {

      this.loading = false;

      this.errorMessage =
        'Username and password should be the same.';
    }
  }
}