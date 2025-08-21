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
  selector: 'app-teacher-dashboard',
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
          <h1>Teacher Dashboard</h1>
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
              <mat-icon>event</mat-icon>
            </div>
            <div class="stat-details">
              <h2>{{stats?.myEvents || 0}}</h2>
              <p>My Events</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon pending">
              <mat-icon>pending</mat-icon>
            </div>
            <div class="stat-details">
              <h2>{{stats?.pendingEvents || 0}}</h2>
              <p>Pending Approval</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon approved">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-details">
              <h2>{{stats?.approvedEvents || 0}}</h2>
              <p>Approved Events</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon attendees">
              <mat-icon>groups</mat-icon>
            </div>
            <div class="stat-details">
              <h2>{{stats?.totalAttendees || 0}}</h2>
              <p>Total Attendees</p>
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
              <mat-icon>add</mat-icon>
              Create Event
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
              <mat-icon>analytics</mat-icon>
              Analytics
            </button>
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

    .stat-icon.pending {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    .stat-icon.approved {
      background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
    }

    .stat-icon.attendees {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
  `]
})
export class TeacherDashboardComponent implements OnInit {
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