import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  pendingEvents: number;
  approvedEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  unreadNotifications: number;
}

interface PendingEvent {
  _id: string;
  title: string;
  organizer: { firstName: string; lastName: string };
  category: string;
  startDate: string;
  status: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatBadgeModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  user: any;
  stats: DashboardStats | null = null;
  pendingEvents: PendingEvent[] = [];
  loading = true;
  
  displayedColumns: string[] = ['title', 'organizer', 'category', 'date', 'actions'];

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
    this.loading = true;
    
    // Load statistics
    this.http.get<any>('http://localhost:5001/api/stats/dashboard').subscribe({
      next: (response) => {
        this.stats = response.data;
      },
      error: (error) => console.error('Error loading stats:', error)
    });

    // Load pending events
    this.http.get<any>('http://localhost:5001/api/events?status=pending').subscribe({
      next: (response) => {
        this.pendingEvents = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pending events:', error);
        this.loading = false;
      }
    });
  }

  approveEvent(eventId: string): void {
    this.http.put(`http://localhost:5001/api/events/${eventId}/status`, { status: 'approved' })
      .subscribe({
        next: () => {
          this.loadDashboardData();
        },
        error: (error) => console.error('Error approving event:', error)
      });
  }

  rejectEvent(eventId: string): void {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      this.http.put(`http://localhost:5001/api/events/${eventId}/status`, { 
        status: 'rejected',
        rejectionReason: reason 
      }).subscribe({
        next: () => {
          this.loadDashboardData();
        },
        error: (error) => console.error('Error rejecting event:', error)
      });
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
  }
}
