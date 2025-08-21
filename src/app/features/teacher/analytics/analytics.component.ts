import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  selectedPeriod = '30days';
  
  overviewStats = {
    totalEvents: 24,
    totalAttendees: 486,
    avgAttendance: 85,
    completionRate: 92
  };

  performanceMetrics = {
    registrationRate: 78,
    attendanceRate: 85,
    satisfactionScore: 4.5,
    engagementRate: 92
  };

  eventsByCategory = [
    { category: 'Academic', count: 8, percentage: 33 },
    { category: 'Workshop', count: 6, percentage: 25 },
    { category: 'Seminar', count: 4, percentage: 17 },
    { category: 'Career', count: 3, percentage: 13 },
    { category: 'Technical', count: 3, percentage: 12 }
  ];

  monthlyTrend = [
    { month: 'Jan', events: 3, attendees: 65 },
    { month: 'Feb', events: 4, attendees: 82 },
    { month: 'Mar', events: 5, attendees: 94 },
    { month: 'Apr', events: 4, attendees: 78 },
    { month: 'May', events: 6, attendees: 102 },
    { month: 'Jun', events: 2, attendees: 65 }
  ];

  topEvents = [
    { 
      title: 'Web Development Workshop',
      date: new Date('2024-03-15'),
      attendees: 45,
      rating: 4.8,
      completionRate: 95
    },
    {
      title: 'AI & Machine Learning Seminar',
      date: new Date('2024-03-10'),
      attendees: 38,
      rating: 4.6,
      completionRate: 92
    },
    {
      title: 'Career Fair 2024',
      date: new Date('2024-02-28'),
      attendees: 52,
      rating: 4.5,
      completionRate: 100
    },
    {
      title: 'Mobile App Development',
      date: new Date('2024-02-20'),
      attendees: 34,
      rating: 4.7,
      completionRate: 88
    }
  ];

  attendeeInsights = {
    newAttendees: 156,
    returningAttendees: 330,
    avgEventsPerAttendee: 2.4,
    topDepartments: [
      { name: 'Computer Science', percentage: 35 },
      { name: 'Engineering', percentage: 28 },
      { name: 'Business', percentage: 20 },
      { name: 'Arts', percentage: 17 }
    ]
  };

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    // In a real app, this would fetch data from the backend
    console.log('Loading analytics for period:', this.selectedPeriod);
  }

  onPeriodChange(): void {
    this.loadAnalytics();
  }

  exportReport(): void {
    console.log('Exporting analytics report...');
    // Implement export functionality
  }

  getRatingStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('star');
    }
    if (halfStar) {
      stars.push('star_half');
    }
    while (stars.length < 5) {
      stars.push('star_border');
    }
    
    return stars;
  }

  getProgressColor(value: number): string {
    if (value >= 80) return 'primary';
    if (value >= 60) return 'accent';
    return 'warn';
  }

  getCategoryColor(index: number): string {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#fda085', '#84fab0'];
    return colors[index % colors.length];
  }
}