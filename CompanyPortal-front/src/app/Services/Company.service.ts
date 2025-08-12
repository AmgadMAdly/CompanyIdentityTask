import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../Core/Models/ApiResponse';
import { CompanyProfileDto } from '../Core/Models/CompanyProfileDto';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}api/home`;
constructor() { }
 getHome(): Observable<ApiResponse<CompanyProfileDto>> {
    return this.http.get<ApiResponse<CompanyProfileDto>>(this.base);
  }

  /** POST /api/home/update-logo (multipart/form-data with field name 'logo') */
  updateLogo(file: File | Blob, fileName?: string): Observable<ApiResponse<string>> {
    const form = new FormData();
    // ensure a filename exists when Blob is passed
    const name = file instanceof File ? file.name : (fileName ?? 'logo.png');
    form.append('logo', file, name);

    return this.http.post<ApiResponse<string>>(`${this.base}/update-logo`, form);
  }
}
