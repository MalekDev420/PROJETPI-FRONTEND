import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationDropdownComponent } from '../../../shared/components/notification-dropdown/notification-dropdown.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    NotificationDropdownComponent
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div class="header-left">
          <h1>Student Dashboard</h1>
          <p>Welcome back, {{user?.fullName}}!</p>
        </div>
        <div class="header-right">
          <app-notification-dropdown></app-notification-dropdown>
          <button mat-icon-button (click)="logout()">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>event_available</mat-icon>
            </div>
            <div class="stat-details">
              <h2>{{stats?.registeredEvents || 0}}</h2>
              <p>Registered Events</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon attended">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-details">
              <h2>{{stats?.attendedEvents || 0}}</h2>
              <p>Attended Events</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon upcoming">
              <mat-icon>schedule</mat-icon>
            </div>
            <div class="stat-details">
              <h2>{{stats?.upcomingEvents || 0}}</h2>
              <p>Upcoming Events</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon notifications">
              <mat-icon>notifications</mat-icon>
            </div>
            <div class="stat-details">
              <h2>{{stats?.unreadNotifications || 0}}</h2>
              <p>Notifications</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="actions-card">
        <mat-card-header>
          <mat-card-title>Quick Actions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="action-buttons">
            <button mat-raised-button color="primary">
              <mat-icon>search</mat-icon>
              Browse Events
            </button>
            <button mat-raised-button color="accent">
              <mat-icon>event</mat-icon>
              My Events
            </button>
            <button mat-raised-button>
              <mat-icon>calendar_today</mat-icon>
              Calendar
            </button>
            <button mat-raised-button>
              <mat-icon>card_membership</mat-icon>
              Certificates
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="upcoming-events">
        <mat-card-header>
          <mat-card-title>Upcoming Events</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="event-list">
            <div class="event-item">
              <div class="event-date">
                <span class="day">15</span>
                <span class="month">JAN</span>
              </div>
              <div class="event-details">
                <h3>AI & Machine Learning Workshop</h3>
                <p><mat-icon>schedule</mat-icon> 2:00 PM - 5:00 PM</p>
                <p><mat-icon>location_on</mat-icon> Room A-101</p>
              </div>
              <div class="event-action">
                <button mat-button color="primary">View Details</button>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .header-left h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 500;
    }

    .header-left p {
      margin: 8px 0 0;
      color: #666;
      font-size: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 24px;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-icon.attended {
      background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
    }

    .stat-icon.upcoming {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .stat-icon.notifications {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    .stat-icon mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
    }

    .stat-details h2 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
    }

    .stat-details p {
      margin: 4px 0 0;
      color: #666;
      font-size: 14px;
    }

    .actions-card {
      margin-bottom: 32px;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .action-buttons button mat-icon {
      margin-right: 8px;
    }

    .upcoming-events {
      margin-bottom: 32px;
    }

    .event-item {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .event-date {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      background: #f5f5f5;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
    }

    .event-date .day {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .event-date .month {
      font-size: 12px;
      color: #666;
    }

    .event-details {
      flex: 1;
    }

    .event-details h3 {
      margin: 0 0 8px;
      font-size: 18px;
    }

    .event-details p {
      margin: 4px 0;
      color: #666;
      font-size: 14px;
      display: flex;
      align-items: center;
    }

    .event-details mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  user: any;
  stats: any = {};
  loading = true;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.http.get<any>('http://localhost:5001/api/stats/dashboard').subscribe({
      next: (response) => {
        this.stats = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}