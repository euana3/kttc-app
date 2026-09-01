import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  LucideDynamicIcon,
  LucideLock,
  LucideEye,
  LucideEyeOff,
} from '@lucide/angular';
import { environment } from '../../environment/environment';

type IconType = typeof LucideLock | typeof LucideEye | typeof LucideEyeOff;
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, LucideDynamicIcon],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss'
})

export class ChangePassword {

  protected readonly lockIcon: IconType = LucideLock;
  protected readonly eyeIcon: IconType = LucideEye;
  protected readonly eyeOffIcon: IconType = LucideEyeOff;

  protected readonly submitStatus = signal<SubmitStatus>('idle');
  protected readonly statusMessage = signal('');

  protected readonly showCurrentPassword = signal(false);
  protected readonly showNewPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);

  protected passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordsMatchValidator });
  }

  protected togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') this.showCurrentPassword.update(v => !v);
    if (field === 'new') this.showNewPassword.update(v => !v);
    if (field === 'confirm') this.showConfirmPassword.update(v => !v);
  }

  protected onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.statusMessage.set(
        this.passwordForm.errors?.['passwordMismatch']
          ? 'New password and confirmation do not match.'
          : 'Please fill in all fields correctly.'
      );
      this.submitStatus.set('error');
      this.autoResetStatus();
      return;
    }

    const userId = sessionStorage.getItem('userId');
    const username = sessionStorage.getItem('username');
    const { newPassword } = this.passwordForm.value;

    if (!userId || !username) {
      this.statusMessage.set('Session expired. Please log in again.');
      this.submitStatus.set('error');
      this.autoResetStatus();
      return;
    }

    this.submitStatus.set('loading');
    this.statusMessage.set('');

    this.http.post<any>(`${environment.apiUrl}/login/update`, {
      id: userId,
      username,
      password: newPassword,
    }).subscribe({
      next: () => {
        this.submitStatus.set('success');
        this.statusMessage.set('Password updated successfully.');
        this.passwordForm.reset();
        this.autoResetStatus();
      },
      error: (err) => {
        this.submitStatus.set('error');
        this.statusMessage.set(err?.error?.error ?? 'Failed to update password. Please try again.');
        this.autoResetStatus();
      },
    });
  }

  // Hides the bar and message a few seconds after resolving, so it doesn't linger forever.
  private autoResetStatus(): void {
    setTimeout(() => {
      this.submitStatus.set('idle');
      this.statusMessage.set('');
    }, 4000);
  }
}