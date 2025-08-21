import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <button mat-icon-button 
            [matBadge]="unreadCount" 
            [matBadgeHidden]="unreadCount === 0"
            matBadgeColor="warn"
            matBadgeSize="small"
            matTooltip="Notifications"
            (click)="openNotifications()"
            class="notification-bell">
      <mat-icon [class.has-notifications]="unreadCount > 0">
        {{unreadCount > 0 ? 'notifications_active' : 'notifications'}}
      </mat-icon>
    </button>
  `,
  styles: [`
    .notification-bell {
      position: relative;
    }

    .notification-bell mat-icon {
      transition: all 0.3s ease;
    }

    .notification-bell mat-icon.has-notifications {
      animation: ring 2s ease-in-out infinite;
      color: #ff9800;
    }

    @keyframes ring {
      0% { transform: rotate(0deg); }
      10% { transform: rotate(10deg); }
      20% { transform: rotate(-10deg); }
      30% { transform: rotate(10deg); }
      40% { transform: rotate(-10deg); }
      50% { transform: rotate(0deg); }
      100% { transform: rotate(0deg); }
    }

    ::ng-deep .mat-badge-content {
      font-size: 10px;
      font-weight: 600;
    }
  `]
})
export class NotificationBellComponent implements OnInit {
  unreadCount = 0;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to unread count
    this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadCount = count;
    });
    
    // Start loading notifications
    this.notificationService.loadNotifications().subscribe();
  }

  openNotifications(): void {
    this.router.navigate(['/notifications']);
  }
}