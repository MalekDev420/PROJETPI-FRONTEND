import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  startDate: Date;
  endDate: Date;
  location: string;
  maxParticipants: number;
  organizer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  registrations: any[];
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-event-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule
  ],
  templateUrl: './event-management.component.html',
  styleUrls: ['./event-management.component.scss']
})
export class EventManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  events: Event[] = [];
  dataSource = new MatTableDataSource<Event>([]);
  displayedColumns: string[] = [
    'title',
    'category',
    'organizer',
    'date',
    'location',
    'registrations',
    'status',
    'actions'
  ];

  loading = false;
  selectedTab = 0;
  statusFilter = 'all';
  searchTerm = '';
  
  categories = [
    'Academic',
    'Workshop',
    'Seminar',
    'Social',
    'Career',
    'Sports',
    'Cultural',
    'Technical'
  ];

  stats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    upcoming: 0,
    past: 0
  };

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadEvents(): void {
    this.loading = true;
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Set headers with authentication
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    // Use admin endpoint to get all events regardless of status
    this.http.get<any>('http://localhost:5001/api/events/admin/all', { headers }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.events = response.data;
          this.filterEventsByStatus();
          this.calculateStats();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        // If admin endpoint fails, fallback to regular endpoint for testing
        if (error.status === 401 || error.status === 403) {
          console.log('Admin endpoint failed, trying public endpoint...');
          this.loadPublicEvents();
        } else {
          this.snackBar.open('Error loading events', 'Close', { duration: 3000 });
          this.loading = false;
        }
      }
    });
  }

  // Fallback method to load public events
  loadPublicEvents(): void {
    this.http.get<any>('http://localhost:5001/api/events').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.events = response.data;
          this.filterEventsByStatus();
          this.calculateStats();
          this.snackBar.open('Note: Showing only approved events (admin access required for all events)', 'Close', { duration: 5000 });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.snackBar.open('Error loading events', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  filterEventsByStatus(): void {
    let filteredEvents = [...this.events];
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.status === this.statusFilter);
    }
    
    // Apply search filter if exists
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term) ||
        (event.organizer && (
          event.organizer.firstName.toLowerCase().includes(term) ||
          event.organizer.lastName.toLowerCase().includes(term) ||
          event.organizer.email.toLowerCase().includes(term)
        ))
      );
    }
    
    this.dataSource.data = filteredEvents;
  }

  calculateStats(): void {
    const now = new Date();
    this.stats = {
      total: this.events.length,
      pending: this.events.filter(e => e.status === 'pending').length,
      approved: this.events.filter(e => e.status === 'approved').length,
      rejected: this.events.filter(e => e.status === 'rejected').length,
      upcoming: this.events.filter(e => new Date(e.startDate) > now).length,
      past: this.events.filter(e => new Date(e.endDate) < now).length
    };
  }

  applyFilter(): void {
    this.filterEventsByStatus();
  }

  onTabChange(index: number): void {
    const statuses = ['all', 'pending', 'approved', 'rejected'];
    this.statusFilter = statuses[index];
    this.filterEventsByStatus();
  }

  approveEvent(event: Event): void {
    this.updateEventStatus(event._id, 'approved');
  }

  rejectEvent(event: Event): void {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      this.http.put(`http://localhost:5001/api/events/${event._id}/status`, {
        status: 'rejected',
        rejectionReason: reason
      }).subscribe({
        next: () => {
          this.snackBar.open('Event rejected', 'Close', { duration: 3000 });
          this.loadEvents();
        },
        error: (error) => {
          console.error('Error rejecting event:', error);
          this.snackBar.open('Error rejecting event', 'Close', { duration: 3000 });
        }
      });
    }
  }

  updateEventStatus(eventId: string, status: string): void {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    this.http.put(`http://localhost:5001/api/events/${eventId}/status`, { status }, { headers }).subscribe({
      next: () => {
        // Update the event status locally
        const eventIndex = this.events.findIndex(e => e._id === eventId);
        if (eventIndex !== -1) {
          this.events[eventIndex].status = status as 'pending' | 'approved' | 'rejected' | 'cancelled';
          this.filterEventsByStatus();
          this.calculateStats();
        }
        this.snackBar.open(`Event ${status}`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating event:', error);
        this.snackBar.open('Error updating event status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteEvent(event: Event): void {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      this.http.delete(`http://localhost:5001/api/events/${event._id}`, { headers }).subscribe({
        next: () => {
          // Remove the event locally
          const eventIndex = this.events.findIndex(e => e._id === event._id);
          if (eventIndex !== -1) {
            this.events.splice(eventIndex, 1);
            this.filterEventsByStatus();
            this.calculateStats();
          }
          this.snackBar.open('Event deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting event:', error);
          this.snackBar.open('Error deleting event', 'Close', { duration: 3000 });
        }
      });
    }
  }

  viewDetails(event: Event): void {
    // Navigate to event details page or open dialog
    console.log('View details for:', event);
  }

  exportEvents(): void {
    const csv = this.convertToCSV(this.events);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'events.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  convertToCSV(data: Event[]): string {
    const headers = ['Title', 'Category', 'Organizer', 'Date', 'Location', 'Status', 'Registrations'];
    const rows = data.map(e => [
      e.title,
      e.category,
      `${e.organizer.firstName} ${e.organizer.lastName}`,
      new Date(e.startDate).toLocaleDateString(),
      e.location,
      e.status,
      e.registrations.length
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'primary';
      case 'pending': return 'warn';
      case 'rejected': return 'accent';
      case 'cancelled': return 'basic';
      default: return '';
    }
  }

  getCategoryIcon(category: string): string {
    const icons: any = {
      'Academic': 'school',
      'Workshop': 'build',
      'Seminar': 'forum',
      'Social': 'groups',
      'Career': 'work',
      'Sports': 'sports_basketball',
      'Cultural': 'theater_comedy',
      'Technical': 'computer'
    };
    return icons[category] || 'event';
  }
}