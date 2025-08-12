import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../Services/Auth.service';
import { Router } from '@angular/router';
import { phoneValidator, websiteUrlValidator } from '../../../../Core/utils/validators';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
    imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nameAr: ['', [Validators.required]],
      nameEn: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^(\+?\d{1,3}[- ]?)?\d{7,12}$/)]],
      websiteUrl: ['', [Validators.pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/)]]
    });
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    if (errors['required']) {
      return `${field === 'nameAr' ? 'Arabic name' : field === 'nameEn' ? 'English name' : field} is required.`;
    }
    if (errors['email']) {
      return 'Invalid email format.';
    }
    if (errors['pattern']) {
      switch (field) {
        case 'phoneNumber':
          return 'Invalid phone number format. Use country code if needed.';
        case 'websiteUrl':
          return 'Invalid website URL format.';
        default:
          return 'Invalid format.';
      }
    }

    return '';

  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          this.router.navigate(['/auth/verify-otp'], {
            state: { email: this.registerForm.get('email')?.value }
          });
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control) control.markAsTouched();
      });
    }
  }
}
