import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Event {
  _id?: string;
  title: string;
  description: string;
  category: string;
  organizer?: any;
  status?: string;
  startDate: Date | string;
  endDate: Date | string;
  registrationDeadline: Date | string;
  location: {
    room: string;
    building: string;
    address?: string;
    capacity: number;
    virtualLink?: string;
  };
  isVirtual?: boolean;
  isHybrid?: boolean;
  maxParticipants: number;
  minParticipants?: number;
  tags?: string[];
  targetAudience?: string;
  resources?: any[];
  images?: any[];
  registrations?: any[];
  feedback?: any[];
  aiSuggestions?: {
    suggestedTime?: string;
    predictedAttendance?: number;
    confidenceLevel?: number;
    recommendations?: string[];
  };
}

export interface EventFilters {
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly API_URL = 'http://localhost:5001/api';
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  public events$ = this.eventsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get all events with filters
  getEvents(filters?: EventFilters): Observable<any> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<any>(`${this.API_URL}/events`, { params })
      .pipe(
        tap(response => {
          if (response.success) {
            this.eventsSubject.next(response.data);
          }
        })
      );
  }

  // Get single event by ID
  getEventById(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/events/${id}`);
  }

  // Create new event (auth interceptor will add token)
  createEvent(event: Event): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/events`, event);
  }

  // Update event (auth interceptor will add token)
  updateEvent(id: string, event: Partial<Event>): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/events/${id}`, event);
  }

  // Delete event (auth interceptor will add token)
  deleteEvent(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/events/${id}`);
  }

  // Get my events (for teacher)
  getMyEvents(type: 'all' | 'organized' | 'registered' | 'attended' = 'organized'): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/events/my/events?type=${type}`);
  }

  // Register for event
  registerForEvent(eventId: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/events/${eventId}/register`, {});
  }

  // Unregister from event
  unregisterFromEvent(eventId: string): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/events/${eventId}/unregister`);
  }

  // Submit feedback
  submitFeedback(eventId: string, feedback: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/events/${eventId}/feedback`, feedback);
  }

  // Update event status (Admin only)
  updateEventStatus(eventId: string, status: 'approved' | 'rejected', rejectionReason?: string): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/events/${eventId}/status`, { status, rejectionReason });
  }

  // AI Features
  
  // Get time slot suggestions
  getAITimeSuggestions(eventData: Partial<Event>): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/ai/suggest-timeslot`, { eventData });
  }

  // Predict attendance
  predictAttendance(eventData: Partial<Event>): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/ai/predict-attendance`, { eventData });
  }

  // Get event recommendations
  getEventRecommendations(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/ai/recommendations`);
  }

  // Check for conflicts
  checkConflicts(eventData: Partial<Event>): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/ai/conflict-check`, { eventData });
  }

  // Auto-categorize event
  categorizeEvent(title: string, description: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/ai/categorize`, { title, description });
  }

  // Get categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/categories`);
  }


  // Get attended events for feedback
  getAttendedEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/events/attended`);
  }

  // Get my certificates
  getMyCertificates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/certificates`);
  }

  // Download certificate
  downloadCertificate(eventId: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/certificates/${eventId}/download`, {
      responseType: 'blob'
    });
  }

  // Analyze feedback
  analyzeFeedback(eventId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/ai/analyze-feedback/${eventId}`);
  }

  // Mock data for demo
  getMockEvents(): Event[] {
    return [
      {
        _id: '1',
        title: 'Advanced Web Development Workshop',
        description: 'Learn modern web development techniques including React, Node.js, and cloud deployment.',
        category: 'Workshop',
        status: 'approved',
        startDate: new Date('2024-02-15T14:00:00'),
        endDate: new Date('2024-02-15T17:00:00'),
        registrationDeadline: new Date('2024-02-14T23:59:59'),
        location: {
          room: 'Lab 301',
          building: 'Tech Building',
          capacity: 30
        },
        maxParticipants: 30,
        tags: ['web', 'programming', 'javascript'],
        registrations: new Array(25)
      },
      {
        _id: '2',
        title: 'AI & Machine Learning Seminar',
        description: 'Introduction to AI concepts and hands-on machine learning projects.',
        category: 'Seminar',
        status: 'approved',
        startDate: new Date('2024-02-18T10:00:00'),
        endDate: new Date('2024-02-18T12:00:00'),
        registrationDeadline: new Date('2024-02-17T23:59:59'),
        location: {
          room: 'Auditorium A',
          building: 'Main Building',
          capacity: 100
        },
        maxParticipants: 100,
        tags: ['AI', 'ML', 'technology'],
        registrations: new Array(78)
      },
      {
        _id: '3',
        title: 'Database Design Masterclass',
        description: 'Deep dive into database design patterns, optimization, and best practices.',
        category: 'Academic',
        status: 'pending',
        startDate: new Date('2024-02-20T13:00:00'),
        endDate: new Date('2024-02-20T16:00:00'),
        registrationDeadline: new Date('2024-02-19T23:59:59'),
        location: {
          room: 'Room 205',
          building: 'CS Building',
          capacity: 40
        },
        maxParticipants: 40,
        tags: ['database', 'SQL', 'design'],
        registrations: []
      }
    ];
  }
}