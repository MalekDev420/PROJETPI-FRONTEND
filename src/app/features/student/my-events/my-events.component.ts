import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';

interface Event {
  _id: string;
  title: string;
  description: string;
  category: any;
  startDate: string;
  endDate: string;
  location: {
    building: string;
    room: string;
  };
  maxParticipants: number;
  registrations: any[];
  imageUrl?: string;
  instructor?: string;
  status: string;
  attendance?: any[];
}

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.scss']
})
export class MyEventsComponent implements OnInit {
  upcomingEvents: Event[] = [];
  pastEvents: Event[] = [];
  isLoading = false;
  currentUser: any;
  selectedTab = 0;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadMyEvents();
  }

  loadMyEvents(): void {
    this.isLoading = true;
    this.eventService.getMyEvents().subscribe({
      next: (events) => {
        const now = new Date();
        this.upcomingEvents = events.filter((event: Event) => 
          new Date(event.startDate) > now
        );
        this.pastEvents = events.filter((event: Event) => 
          new Date(event.startDate) <= now
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.snackBar.open('Failed to load your events', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  unregisterFromEvent(event: Event): void {
    if (confirm(`Are you sure you want to unregister from "${event.title}"?`)) {
      this.eventService.unregisterFromEvent(event._id).subscribe({
        next: () => {
          this.snackBar.open('Successfully unregistered from event', 'Close', { duration: 3000 });
          this.loadMyEvents();
        },
        error: (error) => {
          console.error('Error unregistering:', error);
          this.snackBar.open('Failed to unregister from event', 'Close', { duration: 3000 });
        }
      });
    }
  }

  downloadCertificate(event: Event): void {
    this.eventService.downloadCertificate(event._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${event.title}.pdf`;
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

  addToCalendar(event: Event): void {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${this.formatDateForGoogle(startDate)}/${this.formatDateForGoogle(endDate)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(`${event.location.building}, Room ${event.location.room}`)}`;
    
    window.open(googleCalendarUrl, '_blank');
  }

  private formatDateForGoogle(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  getDaysUntilEvent(event: Event): number {
    const eventDate = new Date(event.startDate);
    const today = new Date();
    const diffTime = Math.abs(eventDate.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  wasAttended(event: Event): boolean {
    return event.attendance?.some(att => att.user === this.currentUser?.id && att.present) || false;
  }

  getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Technology': 'computer',
      'Business': 'business',
      'Arts': 'palette',
      'Science': 'science',
      'Sports': 'sports_soccer',
      'Music': 'music_note',
      'Education': 'school',
      'Health': 'health_and_safety'
    };
    return iconMap[categoryName] || 'event';
  }
}