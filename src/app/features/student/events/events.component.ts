import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
}

@Component({
  selector: 'app-student-events',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatBadgeModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  categories: any[] = [];
  selectedCategory = 'all';
  searchQuery = '';
  isLoading = false;
  currentUser: any;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadEvents();
    this.loadCategories();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getEvents().subscribe({
      next: (response) => {
        // Check if response is wrapped in success/data or is directly an array
        const events = Array.isArray(response) ? response : (response.data || []);
        this.events = events.filter((event: Event) => 
          event.status === 'approved' && 
          new Date(event.startDate) > new Date()
        );
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.snackBar.open('Failed to load events', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.eventService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredEvents = this.events.filter(event => {
      const matchesCategory = this.selectedCategory === 'all' || 
        (event.category && event.category._id === this.selectedCategory);
      const matchesSearch = !this.searchQuery || 
        event.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  registerForEvent(event: Event): void {
    if (this.isRegistered(event)) {
      this.snackBar.open('You are already registered for this event', 'Close', { duration: 3000 });
      return;
    }

    this.eventService.registerForEvent(event._id).subscribe({
      next: () => {
        this.snackBar.open('Successfully registered for event!', 'Close', { duration: 3000 });
        this.loadEvents();
      },
      error: (error) => {
        console.error('Error registering for event:', error);
        this.snackBar.open('Failed to register for event', 'Close', { duration: 3000 });
      }
    });
  }

  isRegistered(event: Event): boolean {
    return event.registrations?.some(reg => reg.user === this.currentUser?.id);
  }

  getAvailableSpots(event: Event): number {
    return event.maxParticipants - (event.registrations?.length || 0);
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