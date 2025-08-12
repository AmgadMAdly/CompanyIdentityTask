import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../Services/Auth.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
  ],
  providers: [MessageService],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent implements OnInit {
  otpForm: FormGroup;
  email: string = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit() {
    const state = window.history.state;
    if (!state.email) {
      this.router.navigate(['/auth/register']);
      return;
    }
    this.email = state.email;
  }

  resendOtp() {
    this.isLoading = true;
    this.authService.sendOtp(this.email).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'OTP Sent',
          detail: 'A new OTP has been sent to your email'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to send OTP'
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  getErrorMessage(): string {
    const control = this.otpForm.get('otp');
    if (!control || !control.touched) return '';

    if (control.errors?.['required']) {
      return 'OTP is required';
    }
    if (control.errors?.['pattern']) {
      return 'OTP must be 6 digits';
    }

    return '';
  }

  onSubmit(): void {
    if (!this.otpForm.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Input',
        detail: 'Please enter a valid 6-digit OTP'
      });
      return;
    }

    this.isLoading = true;
    const otp = this.otpForm.get('otp')?.value;

    this.authService.verifyOtp(this.email, otp).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/auth/set-password'], {
            state: {
              email: this.email,
              otp: otp
            }
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Verification Failed',
            detail: response.message || 'Invalid OTP, please try again'
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Verification Failed',
          detail: error.error?.message || 'An error occurred while verifying OTP'
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
