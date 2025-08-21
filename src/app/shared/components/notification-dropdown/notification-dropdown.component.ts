import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterModule
  ],
  template: `
    <button mat-icon-button 
            [matMenuTriggerFor]="notificationMenu" 
            [matBadge]="unreadCount" 
            [matBadgeHidden]="unreadCount === 0"
            matBadgeColor="warn"
            matBadgeSize="small"
            matTooltip="Notifications">
      <mat-icon>notifications</mat-icon>
    </button>

    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="notification-header" (click)="$event.stopPropagation()">
        <h3>Notifications</h3>
        <div class="header-actions">
          <button mat-icon-button 
                  matTooltip="Mark all as read" 
                  (click)="markAllAsRead()"
                  [disabled]="unreadCount === 0">
            <mat-icon>done_all</mat-icon>
          </button>
          <button mat-icon-button 
                  matTooltip="Clear all" 
                  (click)="clearAll()"
                  [disabled]="notifications.length === 0">
            <mat-icon>clear_all</mat-icon>
          </button>
        </div>
      </div>
      
      <mat-divider></mat-divider>

      <div class="notification-list" (click)="$event.stopPropagation()">
        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="30"></mat-spinner>
        </div>

        <div *ngIf="!loading && notifications.length === 0" class="empty-state">
          <mat-icon>notifications_none</mat-icon>
          <p>No notifications</p>
        </div>

        <div *ngIf="!loading && notifications.length > 0" class="notifications-container">
          <div *ngFor="let notification of notifications.slice(0, 5)" 
               class="notification-item"
               [class.unread]="!notification.isRead"
               (click)="handleNotificationClick(notification)">
            <div class="notification-icon" [ngClass]="getIconClass(notification.type)">
              <mat-icon>{{getIcon(notification.type)}}</mat-icon>
            </div>
            <div class="notification-content">
              <h4>{{notification.title}}</h4>
              <p>{{notification.message}}</p>
              <span class="notification-time">{{getTimeAgo(notification.createdAt)}}</span>
            </div>
            <button mat-icon-button 
                    class="notification-action"
                    (click)="deleteNotification(notification._id, $event)">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <mat-divider *ngIf="notifications.length > 5"></mat-divider>
      
      <div *ngIf="notifications.length > 5" class="notification-footer" (click)="$event.stopPropagation()">
        <button mat-button color="primary" routerLink="/notifications">
          View All Notifications ({{notifications.length}})
        </button>
      </div>
    </mat-menu>
  `,
  styles: [`
    :host {
      position: relative;
    }

    ::ng-deep .notification-menu {
      width: 400px !important;
      max-width: 90vw;
    }

    .notification-header {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 4px;
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;
      padding: 8px 0;
    }

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }

    .notification-item {
      display: flex;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
      position: relative;
    }

    .notification-item:hover {
      background-color: #f5f5f5;
    }

    .notification-item.unread {
      background-color: #e3f2fd;
    }

    .notification-item.unread:hover {
      background-color: #bbdefb;
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .notification-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: white;
    }

    .notification-icon.info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .notification-icon.success {
      background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
    }

    .notification-icon.warning {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .notification-icon.error {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-content h4 {
      margin: 0 0 4px;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .notification-content p {
      margin: 0 0 4px;
      font-size: 13px;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .notification-time {
      font-size: 11px;
      color: #999;
    }

    .notification-action {
      opacity: 0;
      transition: opacity 0.2s;
    }

    .notification-item:hover .notification-action {
      opacity: 1;
    }

    .notification-footer {
      padding: 8px;
      text-align: center;
    }

    .notification-footer button {
      width: 100%;
    }
  `]
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  loading = false;
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Subscribe to notifications
    this.subscription.add(
      this.notificationService.notifications$.subscribe(
        notifications => this.notifications = notifications
      )
    );

    // Subscribe to unread count
    this.subscription.add(
      this.notificationService.unreadCount$.subscribe(
        count => this.unreadCount = count
      )
    );

    // Load initial notifications
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.loadNotifications().subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.loading = false;
      }
    });
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification._id).subscribe();
    }
    // Navigate to related content if applicable
    if (notification.relatedEvent) {
      // Navigate to event details
      // this.router.navigate(['/events', notification.relatedEvent]);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        console.log('All notifications marked as read');
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
          console.log('All notifications cleared');
        },
        error: (error) => {
          console.error('Error clearing notifications:', error);
        }
      });
    }
  }

  deleteNotification(notificationId: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        console.log('Notification deleted');
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      }
    });
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
}