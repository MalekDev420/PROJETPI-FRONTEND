import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { NotificationService, Notification } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatMenuModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  paginatedNotifications: Notification[] = [];
  selectedNotifications: Set<string> = new Set();
  loading = false;
  currentFilter = 'all';
  
  filters = [
    { value: 'all', label: 'All Notifications', icon: 'inbox' },
    { value: 'unread', label: 'Unread', icon: 'mark_email_unread' },
    { value: 'read', label: 'Read', icon: 'mark_email_read' },
    { value: 'high', label: 'High Priority', icon: 'priority_high' },
    { value: 'events', label: 'Events', icon: 'event' },
    { value: 'system', label: 'System', icon: 'settings' }
  ];

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.paginator.page.subscribe(() => {
        this.updatePaginatedNotifications();
      });
    }
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.notifications = response.data;
          this.applyFilter();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    switch (this.currentFilter) {
      case 'unread':
        this.filteredNotifications = this.notifications.filter(n => !n.isRead);
        break;
      case 'read':
        this.filteredNotifications = this.notifications.filter(n => n.isRead);
        break;
      case 'high':
        this.filteredNotifications = this.notifications.filter(n => 
          n.priority === 'high' || n.priority === 'urgent'
        );
        break;
      case 'events':
        this.filteredNotifications = this.notifications.filter(n => 
          n.type.includes('event') || n.relatedEvent
        );
        break;
      case 'system':
        this.filteredNotifications = this.notifications.filter(n => 
          n.type.includes('system')
        );
        break;
      default:
        this.filteredNotifications = [...this.notifications];
    }
    
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.updatePaginatedNotifications();
  }

  updatePaginatedNotifications(): void {
    if (!this.paginator) {
      this.paginatedNotifications = this.filteredNotifications;
      return;
    }

    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const endIndex = startIndex + this.paginator.pageSize;
    this.paginatedNotifications = this.filteredNotifications.slice(startIndex, endIndex);
  }

  onFilterChange(filter: string): void {
    this.currentFilter = filter;
    this.applyFilter();
  }

  toggleSelection(notification: Notification): void {
    if (this.selectedNotifications.has(notification._id)) {
      this.selectedNotifications.delete(notification._id);
    } else {
      this.selectedNotifications.add(notification._id);
    }
  }

  selectAll(): void {
    this.paginatedNotifications.forEach(n => {
      this.selectedNotifications.add(n._id);
    });
  }

  deselectAll(): void {
    this.selectedNotifications.clear();
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification._id).subscribe({
        next: () => {
          notification.isRead = true;
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  markSelectedAsRead(): void {
    const promises = Array.from(this.selectedNotifications).map(id => {
      const notification = this.notifications.find(n => n._id === id);
      if (notification && !notification.isRead) {
        return this.notificationService.markAsRead(id).toPromise();
      }
      return Promise.resolve();
    });

    Promise.all(promises).then(() => {
      this.loadNotifications();
      this.selectedNotifications.clear();
    });
  }

  deleteNotification(notification: Notification): void {
    this.notificationService.deleteNotification(notification._id).subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      }
    });
  }

  deleteSelected(): void {
    if (confirm(`Delete ${this.selectedNotifications.size} selected notifications?`)) {
      const promises = Array.from(this.selectedNotifications).map(id =>
        this.notificationService.deleteNotification(id).toPromise()
      );

      Promise.all(promises).then(() => {
        this.loadNotifications();
        this.selectedNotifications.clear();
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (error) => {
        console.error('Error marking all as read:', error);
      }
    });
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notificationService.clearAll().subscribe({
        next: () => {
          this.notifications = [];
          this.applyFilter();
        },
        error: (error) => {
          console.error('Error clearing notifications:', error);
        }
      });
    }
  }

  navigateToRelated(notification: Notification): void {
    this.markAsRead(notification);
    
    if (notification.relatedEvent) {
      this.router.navigate(['/events', notification.relatedEvent]);
    }
  }

  getIcon(type: string): string {
    const iconMap: any = {
      'new_event': 'event',
      'event_approved': 'check_circle',
      'event_rejected': 'cancel',
      'event_updated': 'update',
      'event_cancelled': 'event_busy',
      'event_reminder': 'alarm',
      'registration_confirmed': 'how_to_reg',
      'waitlist_promotion': 'trending_up',
      'certificate_available': 'card_membership',
      'system': 'info',
      'default': 'notifications'
    };
    return iconMap[type] || iconMap['default'];
  }

  getIconClass(type: string): string {
    if (type.includes('reject') || type.includes('cancel')) {
      return 'error';
    } else if (type.includes('approved') || type.includes('confirmed')) {
      return 'success';
    } else if (type.includes('reminder') || type.includes('pending')) {
      return 'warning';
    }
    return 'info';
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return 'warn';
      case 'high': return 'accent';
      case 'medium': return 'primary';
      default: return '';
    }
  }

  getTimeAgo(date: Date | string): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diff = now.getTime() - notificationDate.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }
}