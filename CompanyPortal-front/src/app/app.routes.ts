import { Routes } from '@angular/router';
import { authGuard } from './Core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/register', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      { path: 'register', loadComponent: () => import('./features/Company/Auth/register/register.component').then(m => m.RegisterComponent) },
      { path: 'verify-otp', loadComponent: () => import('./features/Company/Auth/verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent) },
      { path: 'set-password', loadComponent: () => import('./features/Company/Auth/set-password/set-password.component').then(m => m.SetPasswordComponent) },
      { path: 'login', loadComponent: () => import('./features/Company/Auth/login/login.component').then(m => m.LoginComponent) }
    ]
  },
  {
    path: 'home',
    loadComponent: () => import('./features/Company/Home/Home/Home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'auth/login' }
];
