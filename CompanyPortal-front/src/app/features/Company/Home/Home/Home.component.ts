import { Component, OnInit } from '@angular/core';
import { CompanyProfileDto } from '../../../../Core/Models/CompanyProfileDto';
import { CompanyService } from '../../../../Services/Company.service';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { environment } from '../../../../../environments/environment';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-Home',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    FileUploadModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './Home.component.html',
  styleUrls: ['./Home.component.css']
})
export class HomeComponent implements OnInit {

   profile?: CompanyProfileDto;
   img: string = environment.apiUrl;
   selectedFile?: File;
   previewUrl?: string;
   isLoading = false;

   constructor(
     private companyService: CompanyService,
     private messageService: MessageService
   ) {}

   ngOnInit() {
     this.loadProfile();
   }

   loadProfile() {
     this.companyService.getHome().subscribe({
       next: (res) => {
         this.profile = res.data;
         this.img = environment.apiUrl + this.profile.logoPath;
       },
       error: (error) => {
         this.messageService.add({
           severity: 'error',
           summary: 'Error',
           detail: 'Failed to load profile'
         });
       }
     });
   }

   onFileSelect(event: { files: File[] }) {
     const file = event.files[0];
     if (file) {
       this.selectedFile = file;
       this.createPreview(file);
       this.messageService.add({
         severity: 'info',
         summary: 'File Selected',
         detail: 'Click Upload to save your new logo'
       });
     }
   }

   createPreview(file: File) {
     const reader = new FileReader();
     reader.onload = () => {
       this.previewUrl = reader.result as string;
     };
     reader.readAsDataURL(file);
   }

   onUpload() {
     if (!this.selectedFile) {
       this.messageService.add({
         severity: 'warn',
         summary: 'No File',
         detail: 'Please select a file first'
       });
       return;
     }

     this.isLoading = true;
     this.companyService.updateLogo(this.selectedFile).subscribe({
       next: (res) => {
         this.messageService.add({
           severity: 'success',
           summary: 'Success',
           detail: 'Logo updated successfully'
         });
         this.loadProfile();
         this.selectedFile = undefined;
         this.previewUrl = undefined;
       },
       error: (error) => {
         this.messageService.add({
           severity: 'error',
           summary: 'Error',
           detail: error.error?.message || 'Failed to update logo'
         });
       },
       complete: () => {
         this.isLoading = false;
       }
     });
   }


}
