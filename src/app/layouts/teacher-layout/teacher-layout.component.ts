import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  path: string;
  icon: string;
  label: string;
  badge?: number;
}

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './teacher-layout.component.html',
  styleUrls: ['./teacher-layout.component.scss']
})
export class TeacherLayoutComponent {
  user: any;
  notificationCount = 3;
  
  menuItems: MenuItem[] = [
    { path: '/teacher/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/teacher/events', icon: 'event', label: 'My Events', badge: 5 },
    { path: '/teacher/create-event', icon: 'add_circle', label: 'Create Event' },
    { path: '/teacher/calendar', icon: 'calendar_today', label: 'Calendar' },
    { path: '/teacher/attendees', icon: 'groups', label: 'Attendees' },
    { path: '/teacher/analytics', icon: 'analytics', label: 'Analytics' },
    { path: '/teacher/ai-assistant', icon: 'psychology', label: 'AI Assistant' },
    { path: '/teacher/notifications', icon: 'notifications', label: 'Notifications', badge: this.notificationCount },
    { path: '/teacher/settings', icon: 'settings', label: 'Settings' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}