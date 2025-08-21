import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-student-certificates',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent implements OnInit {
  certificates: any[] = [];
  isLoading = false;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.isLoading = true;
    this.eventService.getMyCertificates().subscribe({
      next: (certificates) => {
        this.certificates = certificates;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading certificates:', error);
        this.snackBar.open('Failed to load certificates', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  downloadCertificate(certificate: any): void {
    this.eventService.downloadCertificate(certificate.eventId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificate.eventTitle}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Certificate downloaded successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error downloading certificate:', error);
        this.snackBar.open('Failed to download certificate', 'Close', { duration: 3000 });
      }
    });
  }

  shareCertificate(certificate: any): void {
    const shareUrl = `${window.location.origin}/certificates/verify/${certificate._id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      this.snackBar.open('Certificate link copied to clipboard', 'Close', { duration: 3000 });
    });
  }
}