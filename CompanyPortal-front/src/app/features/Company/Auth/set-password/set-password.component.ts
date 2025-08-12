import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { passwordPolicyValidator, passwordMatchValidator } from '../../../../Core/utils/validators';
import { AuthService } from '../../../../Services/Auth.service';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    PasswordModule,
    ButtonModule
  ],
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.css']
})
export class SetPasswordComponent implements OnInit {
  passwordForm: FormGroup;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.passwordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(7),
        passwordPolicyValidator()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: passwordMatchValidator()
    });
  }

  ngOnInit(): void {
    const state = window.history.state;
    if (!state.email) {
      this.router.navigate(['/auth/register']);
      return;
    }
    this.email = state.email;

    this.email = state.email;
  }

  getPasswordErrors(): string[] {
    const control = this.passwordForm.get('password');
    if (!control || !control.errors || !control.touched) return [];

    const errors: string[] = [];
    const err = control.errors;

    if (err['required']) errors.push('Password is required.');
    if (err['minlength']) errors.push('Password must be at least 7 characters long.');
    if (err['uppercase']) errors.push('Password must contain at least one uppercase letter.');
    if (err['number']) errors.push('Password must contain at least one number.');
    if (err['special']) errors.push('Password must contain at least one special character.');

    return errors;
  }

  getConfirmPasswordError(): string {
    const control = this.passwordForm.get('confirmPassword');
    if (!control || !control.touched) return '';

    if (this.passwordForm.hasError('passwordMismatch')) {
      return 'Passwords do not match.';
    }

    if (control.errors?.['required']) {
      return 'Confirm password is required.';
    }

    return '';
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach(key => {
        const control = this.passwordForm.get(key);
        if (control) control.markAsTouched();
      });
      return;
    }

    this.authService.setPassword({
      email: this.email,
      password: this.passwordForm.get('password')?.value,
      confirmPassword: this.passwordForm.get('confirmPassword')?.value
    }).subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
