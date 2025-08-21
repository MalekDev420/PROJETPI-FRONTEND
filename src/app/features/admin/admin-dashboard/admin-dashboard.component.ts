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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Chart, registerables } from 'chart.js';
import { NotificationDropdownComponent } from '../../../shared/components/notification-dropdown/notification-dropdown.component';

Chart.register(...registerables);

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  pendingEvents: number;
  approvedEvents: number;
  completedEvents: number;
  totalRegistrations: number;
  todayRegistrations: number;
  revenue: number;
  growthRate: number;
}

interface PendingEvent {
  _id: string;
  title: string;
  organizer: { 
    _id: string;
    firstName: string; 
    lastName: string;
    email: string;
  };
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  registrations: any[];
  status: string;
  createdAt: string;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'event_created' | 'event_approved' | 'event_rejected' | 'registration';
  message: string;
  timestamp: Date;
  icon: string;
  color: string;
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
    MatBadgeModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule,
    NotificationDropdownComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  user: any;
  stats: DashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalEvents: 0,
    pendingEvents: 0,
    approvedEvents: 0,
    completedEvents: 0,
    totalRegistrations: 0,
    todayRegistrations: 0,
    revenue: 0,
    growthRate: 0
  };
  pendingEvents: PendingEvent[] = [];
  recentActivities: RecentActivity[] = [];
  loading = true;
  
  displayedColumns: string[] = ['title', 'organizer', 'category', 'date', 'registrations', 'actions'];
  
  // Chart data
  eventChart: any;
  userChart: any;
  registrationChart: any;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadRecentActivities();
    setTimeout(() => this.initializeCharts(), 500);
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load statistics
    this.http.get<any>('http://localhost:5001/api/stats/dashboard').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = {
            ...this.stats,
            ...response.data,
            growthRate: this.calculateGrowthRate(response.data)
          };
        }
      },
      error: (error) => console.error('Error loading stats:', error)
    });

    // Load pending events with more details
    this.http.get<any>('http://localhost:5001/api/events?status=pending').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.pendingEvents = response.data.slice(0, 5); // Show only top 5
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pending events:', error);
        this.loading = false;
      }
    });

    // Load all events for statistics
    this.http.get<any>('http://localhost:5001/api/events').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const events = response.data;
          this.stats.totalEvents = events.length;
          this.stats.approvedEvents = events.filter((e: any) => e.status === 'approved').length;
          this.stats.completedEvents = events.filter((e: any) => 
            new Date(e.endDate) < new Date() && e.status === 'approved'
          ).length;
          
          // Calculate total registrations
          this.stats.totalRegistrations = events.reduce((sum: number, event: any) => 
            sum + (event.registrations?.length || 0), 0
          );
        }
      },
      error: (error) => console.error('Error loading events:', error)
    });

    // Load users for statistics
    this.http.get<any>('http://localhost:5001/api/users').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats.totalUsers = response.data.length;
          this.stats.activeUsers = response.data.filter((u: any) => 
            u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ).length;
        }
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  loadRecentActivities(): void {
    // Simulate recent activities (in production, this would come from an API)
    this.recentActivities = [
      {
        id: '1',
        type: 'user_registration',
        message: 'New user John Doe registered',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        icon: 'person_add',
        color: 'primary'
      },
      {
        id: '2',
        type: 'event_created',
        message: 'Event "AI Workshop" was created',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        icon: 'event',
        color: 'accent'
      },
      {
        id: '3',
        type: 'event_approved',
        message: 'Event "Career Fair 2024" was approved',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: 'check_circle',
        color: 'success'
      },
      {
        id: '4',
        type: 'registration',
        message: '15 new registrations for "Tech Summit"',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        icon: 'how_to_reg',
        color: 'info'
      },
      {
        id: '5',
        type: 'event_rejected',
        message: 'Event "Unauthorized Workshop" was rejected',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        icon: 'cancel',
        color: 'warn'
      }
    ];
  }

  calculateGrowthRate(data: any): number {
    // Calculate growth rate (mock calculation)
    return 12.5;
  }

  initializeCharts(): void {
    // Event Status Chart
    const eventCtx = document.getElementById('eventChart') as HTMLCanvasElement;
    if (eventCtx) {
      this.eventChart = new Chart(eventCtx, {
        type: 'doughnut',
        data: {
          labels: ['Approved', 'Pending', 'Rejected', 'Completed'],
          datasets: [{
            data: [
              this.stats.approvedEvents,
              this.stats.pendingEvents,
              this.stats.totalEvents - this.stats.approvedEvents - this.stats.pendingEvents - this.stats.completedEvents,
              this.stats.completedEvents
            ],
            backgroundColor: ['#4caf50', '#ff9800', '#f44336', '#9e9e9e']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // Registration Trend Chart
    const regCtx = document.getElementById('registrationChart') as HTMLCanvasElement;
    if (regCtx) {
      this.registrationChart = new Chart(regCtx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Registrations',
            data: [12, 19, 15, 25, 22, 30, 28],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  approveEvent(event: PendingEvent): void {
    this.http.put(`http://localhost:5001/api/events/${event._id}/status`, { status: 'approved' })
      .subscribe({
        next: () => {
          this.snackBar.open('Event approved successfully!', 'Close', { duration: 3000 });
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error approving event:', error);
          this.snackBar.open('Error approving event. Please try again.', 'Close', { duration: 3000 });
        }
      });
  }

  rejectEvent(event: PendingEvent): void {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      this.http.put(`http://localhost:5001/api/events/${event._id}/status`, { 
        status: 'rejected',
        rejectionReason: reason 
      }).subscribe({
        next: () => {
          this.snackBar.open('Event rejected.', 'Close', { duration: 3000 });
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error rejecting event:', error);
          this.snackBar.open('Error rejecting event. Please try again.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  viewEventDetails(event: PendingEvent): void {
    this.router.navigate(['/admin/events', event._id]);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  getCategoryColor(category: string): string {
    const colors: any = {
      'Academic': 'primary',
      'Workshop': 'accent',
      'Social': 'warn',
      'Sports': 'success',
      'Technical': 'info'
    };
    return colors[category] || 'basic';
  }
}