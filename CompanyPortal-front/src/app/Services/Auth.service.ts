import { LoginResponse } from './../Core/Models/LoginCompany/LoginResponse';
import { LoginRequest } from './../Core/Models/LoginCompany/LoginRequest';
import { RegisterCompanyRequest } from './../Core/Models/RegisterCompany/RegisterCompanyRequest';
import { SetPasswordRequest } from './../Core/Models/LoginCompany/SetPasswordRequest';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

import { ApiResponse } from '../Core/Models/ApiResponse';

interface JwtCustomPayload {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
  exp?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenKey = 'token';
private auth$ = new BehaviorSubject<boolean>(this.hasValidToken());
isAuthenticated$ = this.auth$.asObservable();
  register(payload: RegisterCompanyRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${environment.apiUrl}api/auth/register`,
      payload
    );
  }
    private hasValidToken(): boolean {
    const t = localStorage.getItem('token');
    const e = localStorage.getItem('expired');
    return !!t && !!e && new Date() <= new Date(e);
  }

  verifyOtp(email: string, otp: string): Observable<ApiResponse<object>> {
    const params = new HttpParams().set('email', email).set('otp', otp);
    return this.http.post<ApiResponse<object>>(
      `${environment.apiUrl}api/auth/verify-otp`,
      null,
      { params }
    );
  }

  sendOtp(email: string): Observable<ApiResponse<object>> {
    const params = new HttpParams().set('email', email);
    return this.http.post<ApiResponse<object>>(
      `${environment.apiUrl}api/auth/send-otp`,
      null,
      { params }
    );
  }

  login(payload: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${environment.apiUrl}api/auth/login`,
      payload
    );
  }
  setPassword(payload: SetPasswordRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(
      `${environment.apiUrl}api/auth/set-password`,
      payload
    );
  }


  getAuthToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }


  saveAuthData(data: LoginResponse) {
    localStorage.setItem(this.tokenKey, data.token);

    const decoded = this.decodeToken(data.token);
    if (decoded?.exp) {
      const expiryDate = new Date(decoded.exp * 1000);
      localStorage.setItem('expired', expiryDate.toISOString());
    }
    this.auth$.next(this.hasValidToken());
  }


  logOut(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('expired');
      localStorage.removeItem('role');
      this.auth$.next(false);
    } catch (e) {
      console.error('Logout failed:', e);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    return !!token && !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem('expired');
    if (!expiry) return true;
    return new Date() > new Date(expiry);
  }


  getUserId(): string | null {
    const decoded = this.decodeToken();
    return (
      decoded?.[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ] || null
    );
  }


  getUserName(): string | null {
    const decoded = this.decodeToken();
    return (
      decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      null
    );
  }


  /** 🔹 دالة لفك التوكن */
  private decodeToken(token?: string): JwtCustomPayload | null {
    try {
      return jwtDecode<JwtCustomPayload>(token || this.getAuthToken() || '');
    } catch {
      return null;
    }
  }
}
