import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './student-layout.component.html',
  styleUrls: ['./student-layout.component.scss']
})
export class StudentLayoutComponent {
  isSidenavOpen = true;
  currentUser: any;

  menuItems = [
    { 
      icon: 'dashboard', 
      label: 'Dashboard', 
      route: '/student/dashboard',
      description: 'Overview of your activities' 
    },
    { 
      icon: 'explore', 
      label: 'Browse Events', 
      route: '/student/events',
      description: 'Discover new events' 
    },
    { 
      icon: 'event_note', 
      label: 'My Events', 
      route: '/student/my-events',
      description: 'Your registered events' 
    },
    { 
      icon: 'calendar_month', 
      label: 'Calendar', 
      route: '/student/calendar',
      description: 'Event schedule' 
    },
    { 
      icon: 'workspace_premium', 
      label: 'Certificates', 
      route: '/student/certificates',
      description: 'Your achievements' 
    },
    { 
      icon: 'notifications', 
      label: 'Notifications', 
      route: '/student/notifications',
      badge: 3,
      description: 'Updates and reminders' 
    },
    { 
      icon: 'rate_review', 
      label: 'Feedback', 
      route: '/student/feedback',
      description: 'Rate attended events' 
    },
    { 
      icon: 'person', 
      label: 'Profile', 
      route: '/student/profile',
      description: 'Manage your account' 
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.loadUserData();
  }

  loadUserData(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  toggleSidenav(): void {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}