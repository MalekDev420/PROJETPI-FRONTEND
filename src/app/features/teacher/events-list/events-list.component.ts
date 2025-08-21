import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
// Removed MatTabsModule - using button-based tabs instead
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EventService, Event } from '../../../core/services/event.service';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.scss']
})
export class EventsListComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  loading = false;
  selectedTab = 0;

  displayedColumns: string[] = ['title', 'category', 'date', 'status', 'registrations', 'actions'];

  stats = {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  };

  constructor(
    private eventService: EventService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    
    // Use real API
    this.eventService.getMyEvents('organized').subscribe({
      next: (response) => {
        this.events = response.data || [];
        this.filterEvents();
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loading = false;
        // Fall back to mock data if API fails
        this.events = this.eventService.getMockEvents();
        this.filterEvents();
        this.calculateStats();
        this.snackBar.open('Using demo data', 'Close', { duration: 3000 });
      }
    });
  }

  filterEvents(): void {
    switch (this.selectedTab) {
      case 0: // All
        this.filteredEvents = this.events;
        break;
      case 1: // Approved
        this.filteredEvents = this.events.filter(e => e.status === 'approved');
        break;
      case 2: // Pending
        this.filteredEvents = this.events.filter(e => e.status === 'pending');
        break;
      case 3: // Rejected
        this.filteredEvents = this.events.filter(e => e.status === 'rejected');
        break;
    }
  }

  calculateStats(): void {
    this.stats.total = this.events.length;
    this.stats.approved = this.events.filter(e => e.status === 'approved').length;
    this.stats.pending = this.events.filter(e => e.status === 'pending').length;
    this.stats.rejected = this.events.filter(e => e.status === 'rejected').length;
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
    this.filterEvents();
  }

  createEvent(): void {
    this.router.navigate(['/teacher/create-event']);
  }

  viewEvent(event: Event): void {
    this.router.navigate(['/teacher/events', event._id]);
  }

  editEvent(event: Event): void {
    this.router.navigate(['/teacher/events', event._id, 'edit']);
  }

  duplicateEvent(event: Event): void {
    const duplicate = { ...event };
    delete duplicate._id;
    duplicate.title = `Copy of ${event.title}`;
    duplicate.status = 'pending';
    
    this.eventService.createEvent(duplicate).subscribe({
      next: () => {
        this.snackBar.open('Event duplicated successfully', 'Close', { duration: 3000 });
        this.loadEvents();
      },
      error: () => {
        this.snackBar.open('Failed to duplicate event', 'Close', { duration: 3000 });
      }
    });
  }

  deleteEvent(event: Event): void {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      // Mock delete
      const index = this.events.findIndex(e => e._id === event._id);
      if (index > -1) {
        this.events.splice(index, 1);
        this.filterEvents();
        this.calculateStats();
        this.snackBar.open('Event deleted successfully', 'Close', { duration: 3000 });
      }

      // Uncomment for real API
      // this.eventService.deleteEvent(event._id!).subscribe({
      //   next: () => {
      //     this.snackBar.open('Event deleted successfully', 'Close', { duration: 3000 });
      //     this.loadEvents();
      //   },
      //   error: () => {
      //     this.snackBar.open('Failed to delete event', 'Close', { duration: 3000 });
      //   }
      // });
    }
  }

  viewAnalytics(event: Event): void {
    this.router.navigate(['/teacher/analytics', event._id]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'primary';
      case 'pending': return 'warn';
      case 'rejected': return 'accent';
      default: return '';
    }
  }

  getRegistrationPercentage(event: Event): number {
    if (!event.registrations || !event.maxParticipants) return 0;
    return (event.registrations.length / event.maxParticipants) * 100;
  }
}