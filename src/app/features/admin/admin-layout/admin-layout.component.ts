import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { ThemePalette } from '@angular/material/core';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
  badge?: number;
  badgeColor?: ThemePalette;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  user: any;
  sidenavOpened = true;
  pendingEventsCount = 0;
  unreadNotifications = 0;
  
  menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { title: 'Event Management', icon: 'event', route: '/admin/events', badge: 0, badgeColor: 'warn' },
    { title: 'User Management', icon: 'people', route: '/admin/users' },
    { title: 'Reports & Analytics', icon: 'assessment', route: '/admin/reports' },
    { title: 'Categories', icon: 'category', route: '/admin/categories' },
    { title: 'Notifications', icon: 'notifications', route: '/admin/notifications', badge: 0, badgeColor: 'primary' },
    { title: 'Audit Logs', icon: 'history', route: '/admin/audit-logs' },
    { title: 'System Settings', icon: 'settings', route: '/admin/settings' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadNotificationCounts();
  }

  loadNotificationCounts(): void {
    // Load pending events count
    fetch('http://localhost:5001/api/events?status=pending', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data) {
        this.pendingEventsCount = data.data.length;
        // Update badge for event management
        const eventItem = this.menuItems.find(item => item.route === '/admin/events');
        if (eventItem) {
          eventItem.badge = this.pendingEventsCount;
        }
      }
    })
    .catch(err => console.error('Error loading pending events:', err));

    // Load unread notifications
    fetch('http://localhost:5001/api/notifications', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data) {
        this.unreadNotifications = data.data.filter((n: any) => !n.read).length;
        // Update badge for notifications
        const notifItem = this.menuItems.find(item => item.route === '/admin/notifications');
        if (notifItem) {
          notifItem.badge = this.unreadNotifications;
        }
      }
    })
    .catch(err => console.error('Error loading notifications:', err));
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
  }

  viewProfile(): void {
    this.router.navigate(['/admin/profile']);
  }
}