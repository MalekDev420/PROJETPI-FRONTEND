import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Suggestion {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="ai-assistant-container">
      <div class="page-header">
        <div>
          <h1>AI Assistant</h1>
          <p>Get smart suggestions and insights for your events</p>
        </div>
      </div>

      <div class="content-grid">
        <!-- Chat Interface -->
        <mat-card class="chat-card">
          <mat-card-header>
            <mat-card-title>Event Planning Assistant</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="messages-container">
              <div *ngFor="let message of messages" 
                   class="message"
                   [class.user-message]="message.sender === 'user'"
                   [class.ai-message]="message.sender === 'ai'">
                <mat-icon *ngIf="message.sender === 'ai'">smart_toy</mat-icon>
                <div class="message-content">
                  <div class="message-text" [innerHTML]="formatMessage(message.text)"></div>
                  <small>{{message.timestamp | date:'short'}}</small>
                </div>
              </div>
              <div *ngIf="isTyping" class="typing-indicator">
                <mat-spinner diameter="20"></mat-spinner>
                <span>AI is thinking...</span>
              </div>
            </div>
            
            <div class="input-area">
              <mat-form-field appearance="outline" class="message-input">
                <mat-label>Ask anything about event planning...</mat-label>
                <textarea matInput 
                          [(ngModel)]="currentMessage"
                          (keyup.enter)="sendMessage()"
                          rows="2"></textarea>
              </mat-form-field>
              <button mat-fab color="primary" (click)="sendMessage()" [disabled]="!currentMessage">
                <mat-icon>send</mat-icon>
              </button>
            </div>

            <div class="quick-actions">
              <mat-chip *ngFor="let action of quickActions" (click)="useQuickAction(action)">
                {{action}}
              </mat-chip>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Suggestions Panel -->
        <div class="suggestions-panel">
          <mat-card class="suggestion-card" *ngFor="let suggestion of suggestions">
            <mat-card-content>
              <div class="suggestion-header">
                <mat-icon [color]="'primary'">{{suggestion.icon}}</mat-icon>
                <h3>{{suggestion.title}}</h3>
              </div>
              <p>{{suggestion.description}}</p>
              <button mat-stroked-button color="primary">
                Learn More
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-assistant-container {
      max-width: 1400px;
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

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .chat-card {
      height: 600px;
      display: flex;
      flex-direction: column;
      
      mat-card-content {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #fafafa;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .message {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      
      &.user-message {
        flex-direction: row-reverse;
        
        .message-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
      }
      
      &.ai-message {
        .message-content {
          background: white;
          border: 1px solid #e0e0e0;
        }
      }
      
      mat-icon {
        color: #667eea;
      }
      
      .message-content {
        max-width: 70%;
        padding: 12px 16px;
        border-radius: 12px;
        
        .message-text {
          margin: 0 0 8px;
          line-height: 1.5;
          
          ::ng-deep {
            br {
              display: block;
              margin: 4px 0;
            }
            
            strong {
              font-weight: 600;
            }
            
            em {
              font-style: italic;
            }
            
            code {
              background: rgba(0, 0, 0, 0.1);
              padding: 2px 6px;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
              font-size: 0.9em;
            }
            
            .formatted-list {
              margin: 8px 0;
              padding-left: 20px;
              
              li {
                margin: 4px 0;
                line-height: 1.4;
              }
            }
            
            ol.formatted-list {
              list-style-type: decimal;
            }
            
            ul.formatted-list {
              list-style-type: disc;
            }
            
            a {
              color: #667eea;
              text-decoration: underline;
              
              &:hover {
                text-decoration: none;
              }
            }
          }
        }
        
        small {
          opacity: 0.7;
          font-size: 11px;
        }
      }
    }

    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .input-area {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      
      .message-input {
        flex: 1;
      }
    }

    .quick-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 12px;
      
      mat-chip {
        cursor: pointer;
      }
    }

    .suggestions-panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .suggestion-card {
      .suggestion-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        
        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
        }
        
        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }
      }
      
      p {
        margin: 0 0 16px;
        color: #666;
        font-size: 14px;
      }
      
      button mat-icon {
        margin-left: 4px;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }
  `]
})
export class AiAssistantComponent {
  private readonly API_URL = 'http://localhost:5001/api';
  
  messages: Message[] = [
    {
      text: 'Hello! I\'m your AI Event Assistant. I can help you plan events, suggest optimal times, predict attendance, and provide insights. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  suggestions: Suggestion[] = [
    {
      icon: 'schedule',
      title: 'Optimal Scheduling',
      description: 'Find the best time slots for your events based on attendee availability'
    },
    {
      icon: 'trending_up',
      title: 'Attendance Prediction',
      description: 'Get AI-powered predictions for event attendance'
    },
    {
      icon: 'lightbulb',
      title: 'Event Ideas',
      description: 'Discover trending event topics and formats'
    },
    {
      icon: 'groups',
      title: 'Audience Analysis',
      description: 'Understand your target audience better'
    }
  ];

  quickActions = [
    'Suggest event time',
    'Predict attendance',
    'Generate description',
    'Find similar events',
    'Recommend speakers'
  ];

  currentMessage = '';
  isTyping = false;

  sendMessage(): void {
    if (!this.currentMessage.trim()) return;

    // Add user message
    this.messages.push({
      text: this.currentMessage,
      sender: 'user',
      timestamp: new Date()
    });

    // Save the message and clear input
    const message = this.currentMessage;
    this.currentMessage = '';
    this.isTyping = true;
    
    // Send to real AI API
    this.http.post<any>(`${this.API_URL}/ai/chat`, {
      message: message,
      context: 'events'  // Context for teacher is events
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.messages.push({
            text: response.data.response,
            sender: 'ai',
            timestamp: new Date(response.data.timestamp)
          });
        } else {
          this.messages.push({
            text: 'Sorry, I encountered an error. Please try again.',
            sender: 'ai',
            timestamp: new Date()
          });
        }
        this.isTyping = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('AI Chat Error:', error);
        // Fallback to mock response if API fails
        this.messages.push({
          text: this.generateMockResponse(message),
          sender: 'ai',
          timestamp: new Date()
        });
        this.isTyping = false;
        this.scrollToBottom();
        this.snackBar.open('Using offline mode. Real AI service temporarily unavailable.', 'Close', { duration: 3000 });
      }
    });
  }
  
  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  useQuickAction(action: string): void {
    this.currentMessage = action;
    this.sendMessage();
  }

  private generateMockResponse(question: string): string {
    const responses = [
      'Based on historical data, Tuesday and Thursday afternoons (2-4 PM) show the highest attendance rates for academic events.',
      'I predict approximately 35-40 attendees for this workshop based on similar past events.',
      'Here\'s a suggested description: "Join us for an interactive workshop exploring cutting-edge web development techniques..."',
      'I found 3 similar events that had great success. Would you like to see their formats?',
      'Based on the topic, I recommend reaching out to Dr. Smith and Prof. Johnson as potential speakers.'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  formatMessage(text: string): string {
    // Convert markdown-like formatting to HTML
    let formatted = text
      // Convert line breaks to <br>
      .replace(/\n/g, '<br>')
      // Convert numbered lists
      .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
      // Wrap consecutive list items in <ol>
      .replace(/(<li>.*<\/li>\s*)+/g, '<ol class="formatted-list">$&</ol>')
      // Convert bullet points
      .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\s*)+/g, (match) => {
        if (!match.includes('<ol')) {
          return '<ul class="formatted-list">' + match + '</ul>';
        }
        return match;
      })
      // Bold text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/`(.+?)`/g, '<code>$1</code>')
      // Links (simple URL detection)
      .replace(/https?:\/\/[^\s]+/g, '<a href="$&" target="_blank">$&</a>');
    
    return formatted;
  }
}