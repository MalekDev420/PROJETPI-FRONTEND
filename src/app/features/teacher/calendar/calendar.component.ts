import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventService } from '../../../core/services/event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    FullCalendarModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    dateClick: this.handleDateClick.bind(this),
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true
  };

  viewFilter = 'all';
  categoryFilter = 'all';
  
  events: any[] = [];
  categories = ['Academic', 'Workshop', 'Seminar', 'Social', 'Career', 'Sports', 'Cultural', 'Technical'];

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    // Load real events from API
    this.eventService.getMyEvents('all').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.events = response.data.map((event: any) => ({
      id: event._id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      color: this.getEventColor(event.status || 'pending'),
      extendedProps: {
        category: event.category,
        status: event.status,
        location: event.location,
        registrations: event.registrations?.length || 0,
        maxParticipants: event.maxParticipants
      }
    }));

    this.updateCalendarEvents();
        }
      },
      error: (error) => {
        console.error('Error loading events:', error);
        // Fall back to mock data
        const mockEvents = this.eventService.getMockEvents();
        this.events = mockEvents.map(event => ({
          id: event._id,
          title: event.title,
          start: event.startDate,
          end: event.endDate,
          color: this.getEventColor(event.status || 'pending'),
          extendedProps: {
            category: event.category,
            status: event.status,
            location: event.location,
            registrations: event.registrations?.length || 0,
            maxParticipants: event.maxParticipants
          }
        }));
        this.updateCalendarEvents();
      }
    });
  }

  updateCalendarEvents(): void {
    let filteredEvents = [...this.events];

    if (this.viewFilter !== 'all') {
      filteredEvents = filteredEvents.filter(e => 
        e.extendedProps.status === this.viewFilter
      );
    }

    if (this.categoryFilter !== 'all') {
      filteredEvents = filteredEvents.filter(e => 
        e.extendedProps.category === this.categoryFilter
      );
    }

    this.calendarOptions.events = filteredEvents;
  }

  handleEventClick(clickInfo: any): void {
    const eventId = clickInfo.event.id;
    this.router.navigate(['/teacher/events', eventId]);
  }

  handleDateClick(dateInfo: any): void {
    // Navigate to create event with pre-filled date
    this.router.navigate(['/teacher/create-event'], {
      queryParams: { date: dateInfo.dateStr }
    });
  }

  getEventColor(status: string): string {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'pending': return '#ff9800';
      case 'rejected': return '#f44336';
      case 'completed': return '#9e9e9e';
      default: return '#2196f3';
    }
  }

  onViewFilterChange(): void {
    this.updateCalendarEvents();
  }

  onCategoryFilterChange(): void {
    this.updateCalendarEvents();
  }

  createEvent(): void {
    this.router.navigate(['/teacher/create-event']);
  }

  goToToday(): void {
    const calendarApi = (this.calendarOptions as any).calendar;
    if (calendarApi) {
      calendarApi.today();
    }
  }
}