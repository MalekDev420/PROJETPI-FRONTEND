import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';

Chart.register(...registerables);

interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: {
    room: string;
    building: string;
  };
  maxParticipants: number;
  registrations: any[];
  status: string;
  image?: string;
}

interface DashboardStats {
  registeredEvents: number;
  upcomingEvents: number;
  attendedEvents: number;
  certificates: number;
  favoriteCategories: string[];
  attendanceRate: number;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    RouterLink,
    NotificationBellComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('attendanceChart') attendanceChart: any;
  @ViewChild('categoryChart') categoryChart: any;

  private readonly API_URL = 'http://localhost:5001/api';
  
  // Dashboard data
  stats: DashboardStats = {
    registeredEvents: 0,
    upcomingEvents: 0,
    attendedEvents: 0,
    certificates: 0,
    favoriteCategories: [],
    attendanceRate: 0
  };
  
  upcomingEvents: Event[] = [];
  registeredEvents: Event[] = [];
  recommendedEvents: Event[] = [];
  recentActivities: any[] = [];
  
  loading = true;
  currentUser: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 500);
  }

  loadUserData(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load stats
    this.loadStats();
    
    // Load events
    this.loadUpcomingEvents();
    this.loadRegisteredEvents();
    this.loadRecommendedEvents();
    this.loadRecentActivities();
    
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  loadStats(): void {
    // Try to load from API
    this.http.get<any>(`${this.API_URL}/stats/student`).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats = response.data;
        }
      },
      error: () => {
        // Use mock data for demo
        this.stats = {
          registeredEvents: 5,
          upcomingEvents: 3,
          attendedEvents: 12,
          certificates: 2,
          favoriteCategories: ['Workshop', 'Technical', 'Career'],
          attendanceRate: 85
        };
      }
    });
  }

  loadUpcomingEvents(): void {
    this.http.get<any[]>(`${this.API_URL}/events/my/upcoming`).subscribe({
      next: (events) => {
        // Response is directly an array, not wrapped in success/data
        if (Array.isArray(events)) {
          this.upcomingEvents = events;
        }
      },
      error: () => {
        // Mock data
        this.upcomingEvents = [
          {
            _id: '1',
            title: 'Web Development Workshop',
            description: 'Learn modern web development',
            category: 'Workshop',
            startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
            location: { room: 'Lab 301', building: 'Tech Building' },
            maxParticipants: 30,
            registrations: [],
            status: 'approved'
          },
          {
            _id: '2',
            title: 'Career Fair 2024',
            description: 'Meet top employers',
            category: 'Career',
            startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
            location: { room: 'Main Hall', building: 'Student Center' },
            maxParticipants: 200,
            registrations: [],
            status: 'approved'
          }
        ];
      }
    });
  }

  loadRegisteredEvents(): void {
    this.http.get<any[]>(`${this.API_URL}/events/my/registered`).subscribe({
      next: (events) => {
        // Response is directly an array, not wrapped in success/data
        if (Array.isArray(events)) {
          this.registeredEvents = events;
        }
      },
      error: () => {
        // Use upcoming events as registered for demo
        this.registeredEvents = this.upcomingEvents;
      }
    });
  }

  loadRecommendedEvents(): void {
    this.http.get<any>(`${this.API_URL}/ai/recommendations`).subscribe({
      next: (response) => {
        if (response.success) {
          this.recommendedEvents = response.data;
        }
      },
      error: () => {
        // Mock recommendations
        this.recommendedEvents = [
          {
            _id: '3',
            title: 'AI & Machine Learning Seminar',
            description: 'Introduction to AI concepts',
            category: 'Seminar',
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
            location: { room: 'Auditorium', building: 'Main Building' },
            maxParticipants: 100,
            registrations: [],
            status: 'approved'
          },
          {
            _id: '4',
            title: 'Hackathon 2024',
            description: '24-hour coding challenge',
            category: 'Competition',
            startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
            location: { room: 'Innovation Lab', building: 'Tech Center' },
            maxParticipants: 50,
            registrations: [],
            status: 'approved'
          }
        ];
      }
    });
  }

  loadRecentActivities(): void {
    // Mock recent activities
    this.recentActivities = [
      {
        type: 'registration',
        title: 'Registered for Web Development Workshop',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: 'event_available',
        color: 'primary'
      },
      {
        type: 'attendance',
        title: 'Attended Python Programming Workshop',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        icon: 'check_circle',
        color: 'accent'
      },
      {
        type: 'certificate',
        title: 'Earned certificate for Data Science Course',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        icon: 'workspace_premium',
        color: 'warn'
      },
      {
        type: 'feedback',
        title: 'Provided feedback for Cloud Computing Workshop',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        icon: 'rate_review',
        color: 'primary'
      }
    ];
  }

  initializeCharts(): void {
    // Attendance Chart
    if (this.attendanceChart?.nativeElement) {
      const ctx1 = this.attendanceChart.nativeElement.getContext('2d');
      new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: ['Attended', 'Missed', 'Upcoming'],
          datasets: [{
            data: [12, 2, 3],
            backgroundColor: [
              'rgba(75, 192, 192, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(255, 206, 86, 0.8)'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 12 }
              }
            }
          }
        }
      });
    }

    // Category Interest Chart
    if (this.categoryChart?.nativeElement) {
      const ctx2 = this.categoryChart.nativeElement.getContext('2d');
      new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: ['Workshop', 'Technical', 'Career', 'Academic', 'Social'],
          datasets: [{
            label: 'Events Attended',
            data: [5, 4, 3, 2, 1],
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            borderRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 }
            }
          }
        }
      });
    }
  }

  getEventDate(date: string): Date {
    return new Date(date);
  }

  getDaysUntilEvent(date: string): number {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Workshop': 'primary',
      'Seminar': 'accent',
      'Career': 'warn',
      'Technical': 'primary',
      'Academic': 'accent',
      'Social': 'warn',
      'Competition': 'primary'
    };
    return colors[category] || 'basic';
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'registration': 'event_available',
      'attendance': 'check_circle',
      'certificate': 'workspace_premium',
      'feedback': 'rate_review',
      'cancellation': 'event_busy'
    };
    return icons[type] || 'info';
  }

  registerForEvent(event: Event): void {
    console.log('Registering for event:', event);
    // Implement registration logic
  }

  viewEventDetails(event: Event): void {
    console.log('Viewing event details:', event);
    // Navigate to event details page
  }
}