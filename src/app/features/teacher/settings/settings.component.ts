import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatDividerModule,
    FormsModule
  ],
  template: `
    <div class="settings-container">
      <div class="page-header">
        <h1>Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      <!-- Profile Settings -->
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-card-title>Profile Information</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Full Name</mat-label>
              <input matInput [(ngModel)]="profile.name">
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput [(ngModel)]="profile.email" type="email">
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput [(ngModel)]="profile.phone">
              <mat-icon matPrefix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Department</mat-label>
              <input matInput [(ngModel)]="profile.department">
              <mat-icon matPrefix>business</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Bio</mat-label>
              <textarea matInput [(ngModel)]="profile.bio" rows="3"></textarea>
            </mat-form-field>
          </div>
          <button mat-raised-button color="primary" (click)="saveProfile()">
            <mat-icon>save</mat-icon>
            Save Profile
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Notification Preferences -->
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-card-title>Notification Preferences</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="toggle-list">
            <div class="toggle-item">
              <div>
                <h4>Email Notifications</h4>
                <p>Receive email updates about your events</p>
              </div>
              <mat-slide-toggle [(ngModel)]="notifications.email"></mat-slide-toggle>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="toggle-item">
              <div>
                <h4>Event Reminders</h4>
                <p>Get reminded before your events start</p>
              </div>
              <mat-slide-toggle [(ngModel)]="notifications.reminders"></mat-slide-toggle>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="toggle-item">
              <div>
                <h4>Registration Updates</h4>
                <p>Notify when students register for your events</p>
              </div>
              <mat-slide-toggle [(ngModel)]="notifications.registrations"></mat-slide-toggle>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="toggle-item">
              <div>
                <h4>Analytics Reports</h4>
                <p>Weekly analytics summary for your events</p>
              </div>
              <mat-slide-toggle [(ngModel)]="notifications.analytics"></mat-slide-toggle>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Event Preferences -->
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-card-title>Event Preferences</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Default Event Duration</mat-label>
              <mat-select [(ngModel)]="eventPrefs.defaultDuration">
                <mat-option value="30">30 minutes</mat-option>
                <mat-option value="60">1 hour</mat-option>
                <mat-option value="90">1.5 hours</mat-option>
                <mat-option value="120">2 hours</mat-option>
                <mat-option value="180">3 hours</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Default Category</mat-label>
              <mat-select [(ngModel)]="eventPrefs.defaultCategory">
                <mat-option value="academic">Academic</mat-option>
                <mat-option value="workshop">Workshop</mat-option>
                <mat-option value="seminar">Seminar</mat-option>
                <mat-option value="career">Career</mat-option>
                <mat-option value="technical">Technical</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Default Max Participants</mat-label>
              <input matInput [(ngModel)]="eventPrefs.defaultMaxParticipants" type="number">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Registration Deadline (days before event)</mat-label>
              <input matInput [(ngModel)]="eventPrefs.registrationDeadline" type="number">
            </mat-form-field>
          </div>

          <div class="toggle-list">
            <div class="toggle-item">
              <div>
                <h4>Auto-approve Registrations</h4>
                <p>Automatically approve student registrations</p>
              </div>
              <mat-slide-toggle [(ngModel)]="eventPrefs.autoApprove"></mat-slide-toggle>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="toggle-item">
              <div>
                <h4>Allow Waitlist</h4>
                <p>Enable waitlist when events are full</p>
              </div>
              <mat-slide-toggle [(ngModel)]="eventPrefs.allowWaitlist"></mat-slide-toggle>
            </div>
          </div>

          <button mat-raised-button color="primary" (click)="saveEventPrefs()">
            <mat-icon>save</mat-icon>
            Save Preferences
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Security Settings -->
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-card-title>Security</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <button mat-stroked-button color="primary" (click)="changePassword()">
            <mat-icon>lock</mat-icon>
            Change Password
          </button>
          
          <button mat-stroked-button (click)="enable2FA()">
            <mat-icon>security</mat-icon>
            Enable Two-Factor Authentication
          </button>
          
          <button mat-stroked-button color="warn" (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout from All Devices
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;
      
      h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 500;
      }
      
      p {
        margin: 4px 0 0;
        color: #666;
      }
    }

    .settings-card {
      margin-bottom: 24px;

      mat-card-header {
        margin-bottom: 16px;
      }

      mat-card-content {
        button {
          margin-right: 12px;
          margin-top: 16px;
          
          mat-icon {
            margin-right: 8px;
          }
        }
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 16px;

      .full-width {
        grid-column: 1 / -1;
      }
    }

    .toggle-list {
      .toggle-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;

        h4 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
      }
    }
  `]
})
export class SettingsComponent {
  profile = {
    name: 'Dr. John Smith',
    email: 'teacher@test.com',
    phone: '+1 234 567 8900',
    department: 'Computer Science',
    bio: 'Passionate educator with 10+ years of experience in web development and software engineering.'
  };

  notifications = {
    email: true,
    reminders: true,
    registrations: true,
    analytics: false
  };

  eventPrefs = {
    defaultDuration: '60',
    defaultCategory: 'workshop',
    defaultMaxParticipants: 30,
    registrationDeadline: 2,
    autoApprove: true,
    allowWaitlist: true
  };

  constructor(private authService: AuthService) {}

  saveProfile(): void {
    console.log('Saving profile:', this.profile);
    // Implement save logic
  }

  saveEventPrefs(): void {
    console.log('Saving event preferences:', this.eventPrefs);
    // Implement save logic
  }

  changePassword(): void {
    console.log('Change password');
    // Implement password change dialog
  }

  enable2FA(): void {
    console.log('Enable 2FA');
    // Implement 2FA setup
  }

  logout(): void {
    if (confirm('Are you sure you want to logout from all devices?')) {
      this.authService.logout();
    }
  }
}