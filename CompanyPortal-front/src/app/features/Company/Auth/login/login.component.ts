import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../Services/Auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule
  ],

  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,

  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  isFieldInvalid(name: string): boolean {
    const c = this.loginForm.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched || this.submitted));
  }

  getError(name: string): string {
    const c = this.loginForm.get(name);
    if (!c?.errors) return '';
    if (c.errors['required']) return 'This field is required';
    if (c.errors['email']) return 'Please enter a valid email address';
    return 'Invalid value';
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const payload = {
      email: this.loginForm.value.email.trim(),
      password: this.loginForm.value.password
    };


    this.isLoading = true;
    this.authService.login(payload)
      .pipe(finalize(() => {
        this.isLoading = false;
        console.log('Login request completed');
      }))
      .subscribe({
        next: (res) => {
          console.log('Login response:', res);



          this.authService.saveAuthData(res.data);
          setTimeout(() => {
            this.router.navigateByUrl('/home');
          }, 1000);
        },
        error: (err) => {
          const api = err?.error;
          const msg: string = api?.message;

          // Handle special cases
          if (msg?.startsWith('Account not verified')) {

            this.router.navigate(['/auth/verify-otp'], { state: { email: payload.email } });
            return;
          }

          if (msg?.startsWith('Password not set')) {

            this.router.navigate(['/auth/set-password'], { state: { email: payload.email } });
            return;
          }
        }
      });
  }
}
