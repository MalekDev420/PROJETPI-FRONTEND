import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss']
})
export class CreateEventComponent implements OnInit {
  eventForm!: FormGroup;
  loading = false;
  aiLoading = false;
  
  categories = ['Academic', 'Workshop', 'Seminar', 'Social', 'Career', 'Sports', 'Cultural', 'Technical'];
  buildings = ['Main Building', 'Tech Building', 'Science Hall', 'Arts Center', 'Sports Complex'];
  targetAudiences = ['all', 'students', 'teachers', 'staff', 'specific'];
  
  // AI Suggestions
  aiSuggestions = {
    timeSlot: null as any,
    attendance: null as any,
    category: null as any,
    conflicts: [] as any[]
  };

  // Tags
  tags: string[] = [];
  currentTag = '';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.eventForm = this.fb.group({
      // Basic Information
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      
      // Date and Time
      startDate: [tomorrow, Validators.required],
      startTime: ['14:00', Validators.required],
      endDate: [tomorrow, Validators.required],
      endTime: ['16:00', Validators.required],
      registrationDeadline: [tomorrow, Validators.required],
      
      // Location
      building: ['', Validators.required],
      room: ['', Validators.required],
      capacity: [30, [Validators.required, Validators.min(1)]],
      isVirtual: [false],
      virtualLink: [''],
      
      // Participants
      maxParticipants: [30, [Validators.required, Validators.min(1)]],
      minParticipants: [5, [Validators.required, Validators.min(1)]],
      targetAudience: ['all', Validators.required]
    });

    // Watch for virtual toggle
    this.eventForm.get('isVirtual')?.valueChanges.subscribe(isVirtual => {
      const virtualLinkControl = this.eventForm.get('virtualLink');
      if (isVirtual) {
        virtualLinkControl?.setValidators([Validators.required]);
      } else {
        virtualLinkControl?.clearValidators();
      }
      virtualLinkControl?.updateValueAndValidity();
    });
  }

  // AI Features
  async suggestTimeSlot(): Promise<void> {
    this.aiLoading = true;
    
    // Use real API
    const eventData = this.eventForm.value;
    this.eventService.getAITimeSuggestions(eventData).subscribe({
      next: (response) => {
        this.aiSuggestions.timeSlot = response.data;
        this.aiLoading = false;
        this.snackBar.open('AI suggestion generated!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.aiLoading = false;
        // Fallback to mock response
        this.aiSuggestions.timeSlot = {
          suggestedTime: 'Tuesday, 2:00 PM - 4:00 PM',
          reason: 'This time slot has the highest availability (85%) for your target audience and no conflicts with other events.',
          alternativeTimes: [
            'Wednesday, 10:00 AM - 12:00 PM',
            'Thursday, 3:00 PM - 5:00 PM'
          ]
        };
        this.snackBar.open('Using offline suggestion', 'Close', { duration: 3000 });
      }
    });
  }

  async predictAttendance(): Promise<void> {
    this.aiLoading = true;
    
    // Use real API
    const eventData = this.eventForm.value;
    this.eventService.predictAttendance(eventData).subscribe({
      next: (response) => {
        this.aiSuggestions.attendance = response.data;
        this.aiLoading = false;
        this.snackBar.open('Attendance prediction ready!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.aiLoading = false;
        // Fallback to mock response
        this.aiSuggestions.attendance = {
          expectedAttendance: 45,
          confidenceLevel: 78,
          factors: [
            'Similar events had 70-80% attendance',
            'Time slot is optimal for target audience',
            'Topic has high interest based on past data'
          ]
        };
        this.snackBar.open('Using offline prediction', 'Close', { duration: 3000 });
      }
    });
  }

  async checkConflicts(): Promise<void> {
    this.aiLoading = true;
    
    // Use real API
    const eventData = this.eventForm.value;
    this.eventService.checkConflicts(eventData).subscribe({
      next: (response) => {
        this.aiSuggestions.conflicts = response.data.conflicts || [];
        this.aiLoading = false;
        
        if (this.aiSuggestions.conflicts.length > 0) {
          this.snackBar.open('Potential conflicts detected!', 'View', { duration: 5000 });
        } else {
          this.snackBar.open('No conflicts found!', 'Close', { duration: 3000 });
        }
      },
      error: () => {
        this.aiLoading = false;
        // Fallback to mock response
        this.aiSuggestions.conflicts = [];
        this.snackBar.open('Could not check conflicts - offline mode', 'Close', { duration: 3000 });
      }
    });
  }

  async categorizeEvent(): Promise<void> {
    const title = this.eventForm.get('title')?.value;
    const description = this.eventForm.get('description')?.value;
    
    if (!title || !description) {
      this.snackBar.open('Please enter title and description first', 'Close', { duration: 3000 });
      return;
    }
    
    this.aiLoading = true;
    
    // Use real API
    this.eventService.categorizeEvent(title, description).subscribe({
      next: (response) => {
        this.aiSuggestions.category = response.data;
        
        // Auto-fill category
        this.eventForm.patchValue({ category: this.aiSuggestions.category.category });
        
        // Add suggested tags
        if (this.aiSuggestions.category.tags) {
          this.tags = [...new Set([...this.tags, ...this.aiSuggestions.category.tags])];
        }
        
        this.aiLoading = false;
        this.snackBar.open('Category suggested by AI!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.aiLoading = false;
        // Fallback to mock response
        this.aiSuggestions.category = {
          category: 'Workshop',
          confidence: 0.85,
          tags: ['programming', 'web development', 'hands-on']
        };
        this.eventForm.patchValue({ category: this.aiSuggestions.category.category });
        this.tags = [...new Set([...this.tags, ...this.aiSuggestions.category.tags])];
        this.snackBar.open('Category suggested (offline mode)!', 'Close', { duration: 3000 });
      }
    });
  }

  // Tag Management
  addTag(): void {
    if (this.currentTag && !this.tags.includes(this.currentTag)) {
      this.tags.push(this.currentTag.toLowerCase());
      this.currentTag = '';
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  // Form Submission
  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    
    const formValue = this.eventForm.value;
    
    // Combine date and time
    const startDateTime = new Date(formValue.startDate);
    const [startHours, startMinutes] = formValue.startTime.split(':');
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));
    
    const endDateTime = new Date(formValue.endDate);
    const [endHours, endMinutes] = formValue.endTime.split(':');
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));
    
    const eventData: any = {
      title: formValue.title,
      description: formValue.description,
      category: formValue.category,
      startDate: startDateTime,
      endDate: endDateTime,
      registrationDeadline: formValue.registrationDeadline,
      location: {
        room: formValue.room,
        building: formValue.building,
        capacity: formValue.capacity,
        virtualLink: formValue.virtualLink
      },
      isVirtual: formValue.isVirtual,
      maxParticipants: formValue.maxParticipants,
      minParticipants: formValue.minParticipants,
      targetAudience: formValue.targetAudience,
      tags: this.tags
      // Remove aiSuggestions as it's not matching the interface and not needed for creation
    };

    // Use real API
    this.eventService.createEvent(eventData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.snackBar.open('Event created successfully! Waiting for admin approval.', 'Close', { duration: 4000 });
          this.router.navigate(['/teacher/events']);
        } else {
          this.snackBar.open(response.message || 'Failed to create event', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.loading = false;
        const message = error.error?.message || 'Failed to create event. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        console.error('Create event error:', error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/teacher/events']);
  }
}