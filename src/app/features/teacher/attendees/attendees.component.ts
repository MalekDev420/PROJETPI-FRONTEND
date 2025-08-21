import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';

interface Attendee {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  registrationDate: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
  checkInTime?: Date;
  event: {
    _id: string;
    title: string;
    date: Date;
  };
}

@Component({
  selector: 'app-attendees',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './attendees.component.html',
  styleUrls: ['./attendees.component.scss']
})
export class AttendeesComponent implements OnInit {
  attendees: Attendee[] = [];
  filteredAttendees: Attendee[] = [];
  events: any[] = [];
  selectedEvent = 'all';
  searchTerm = '';
  loading = false;
  
  displayedColumns: string[] = ['name', 'email', 'studentId', 'event', 'registrationDate', 'status', 'checkIn', 'actions'];
  
  stats = {
    total: 0,
    confirmed: 0,
    pending: 0,
    checkedIn: 0
  };

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    // Load real events from API
    this.eventService.getMyEvents('all').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.events = response.data;
          
          // Extract attendees from events
          this.attendees = [];
          this.events.forEach(event => {
            if (event.registrations && event.registrations.length > 0) {
              event.registrations.forEach((reg: any) => {
                this.attendees.push({
                  _id: `${event._id}_${reg.user?._id || reg.user}`,
                  name: reg.user?.firstName ? `${reg.user.firstName} ${reg.user.lastName}` : 'Unknown User',
                  email: reg.user?.email || 'No email',
                  studentId: reg.user?.studentId || 'N/A',
                  registrationDate: new Date(reg.registeredAt),
                  status: reg.attended ? 'confirmed' : 'pending',
                  checkInTime: reg.checkInTime ? new Date(reg.checkInTime) : undefined,
                  event: {
                    _id: event._id,
                    title: event.title,
                    date: new Date(event.startDate)
                  }
                });
              });
            }
          });
          
          this.filterAttendees();
          this.calculateStats();
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading events:', error);
        // Fall back to mock data
        this.events = this.eventService.getMockEvents();
        this.attendees = this.generateMockAttendees();
        this.filterAttendees();
        this.calculateStats();
        this.loading = false;
      }
    });
  }

  generateMockAttendees(): Attendee[] {
    const mockAttendees: Attendee[] = [];
    const statuses: ('confirmed' | 'pending' | 'cancelled')[] = ['confirmed', 'pending', 'cancelled'];
    
    this.events.forEach(event => {
      const attendeeCount = Math.floor(Math.random() * 15) + 5;
      for (let i = 0; i < attendeeCount; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const attendee: Attendee = {
          _id: `attendee_${event._id}_${i}`,
          name: `Student ${i + 1}`,
          email: `student${i + 1}@university.edu`,
          studentId: `STU${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          registrationDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          status: status,
          event: {
            _id: event._id || '',
            title: event.title,
            date: new Date(event.startDate)
          }
        };
        
        // Add check-in time for some confirmed attendees
        if (status === 'confirmed' && Math.random() > 0.3) {
          attendee.checkInTime = new Date(event.startDate);
        }
        
        mockAttendees.push(attendee);
      }
    });
    
    return mockAttendees;
  }

  filterAttendees(): void {
    let filtered = [...this.attendees];
    
    // Filter by event
    if (this.selectedEvent !== 'all') {
      filtered = filtered.filter(a => a.event._id === this.selectedEvent);
    }
    
    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(term) ||
        a.email.toLowerCase().includes(term) ||
        a.studentId.toLowerCase().includes(term)
      );
    }
    
    this.filteredAttendees = filtered;
  }

  calculateStats(): void {
    this.stats.total = this.filteredAttendees.length;
    this.stats.confirmed = this.filteredAttendees.filter(a => a.status === 'confirmed').length;
    this.stats.pending = this.filteredAttendees.filter(a => a.status === 'pending').length;
    this.stats.checkedIn = this.filteredAttendees.filter(a => a.checkInTime).length;
  }

  onEventFilterChange(): void {
    this.filterAttendees();
    this.calculateStats();
  }

  onSearchChange(): void {
    this.filterAttendees();
    this.calculateStats();
  }

  checkInAttendee(attendee: Attendee): void {
    attendee.checkInTime = new Date();
    attendee.status = 'confirmed';
    this.calculateStats();
  }

  confirmAttendee(attendee: Attendee): void {
    attendee.status = 'confirmed';
    this.calculateStats();
  }

  cancelRegistration(attendee: Attendee): void {
    attendee.status = 'cancelled';
    this.calculateStats();
  }

  sendReminder(attendee: Attendee): void {
    console.log('Sending reminder to:', attendee.email);
    // Implement reminder logic
  }

  exportAttendees(): void {
    // Implement export logic
    const csv = this.convertToCSV(this.filteredAttendees);
    this.downloadCSV(csv, 'attendees.csv');
  }

  convertToCSV(data: Attendee[]): string {
    const headers = ['Name', 'Email', 'Student ID', 'Event', 'Registration Date', 'Status', 'Check-In Time'];
    const rows = data.map(a => [
      a.name,
      a.email,
      a.studentId,
      a.event.title,
      a.registrationDate.toLocaleDateString(),
      a.status,
      a.checkInTime ? a.checkInTime.toLocaleString() : 'Not checked in'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed': return 'primary';
      case 'pending': return 'warn';
      case 'cancelled': return 'accent';
      default: return '';
    }
  }
}