import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 24px;">
      <h1>Event Details</h1>
      <p>This feature is coming soon...</p>
    </div>
  `
})
export class EventDetailsComponent {}