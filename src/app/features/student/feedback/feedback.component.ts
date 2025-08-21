import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-student-feedback',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  attendedEvents: any[] = [];
  isLoading = false;
  selectedEvent: any = null;
  feedback = {
    rating: 0,
    comments: '',
    improvements: ''
  };

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAttendedEvents();
  }

  loadAttendedEvents(): void {
    this.isLoading = true;
    this.eventService.getAttendedEvents().subscribe({
      next: (events) => {
        this.attendedEvents = events.filter((e: any) => !e.feedbackSubmitted);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.snackBar.open('Failed to load events', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  selectEvent(event: any): void {
    this.selectedEvent = event;
    this.feedback = {
      rating: 0,
      comments: '',
      improvements: ''
    };
  }

  setRating(rating: number): void {
    this.feedback.rating = rating;
  }

  submitFeedback(): void {
    if (!this.selectedEvent || this.feedback.rating === 0) {
      this.snackBar.open('Please select an event and provide a rating', 'Close', { duration: 3000 });
      return;
    }

    this.eventService.submitFeedback(this.selectedEvent._id, this.feedback).subscribe({
      next: () => {
        this.snackBar.open('Feedback submitted successfully', 'Close', { duration: 3000 });
        this.selectedEvent = null;
        this.loadAttendedEvents();
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
        this.snackBar.open('Failed to submit feedback', 'Close', { duration: 3000 });
      }
    });
  }
}