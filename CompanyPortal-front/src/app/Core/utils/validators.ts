import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const websiteUrlValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const regex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;
    return regex.test(control.value) ? null : { invalidWebsite: true };
  };
};

export const phoneValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const regex = /^(\+?\d{1,3}[- ]?)?\d{7,12}$/;
    return regex.test(control.value) ? null : { invalidPhone: true };
  };
};

export const passwordPolicyValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const minLength = control.value.length >= 7;
    const hasUppercase = /[A-Z]/.test(control.value);
    const hasDigit = /\d/.test(control.value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(control.value);

    const valid = minLength && hasUppercase && hasDigit && hasSpecialChar;
    
    return valid ? null : {
      passwordPolicy: {
        minLength,
        hasUppercase,
        hasDigit,
        hasSpecialChar
      }
    };
  };
};

export const passwordMatchValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  };
};
