import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

interface ChatMessage {
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <div class="ai-chatbot" [class.expanded]="isExpanded">
      <!-- Floating Button -->
      <button 
        *ngIf="!isExpanded" 
        mat-fab 
        color="primary" 
        class="chat-fab"
        (click)="toggleChat()"
        matTooltip="AI Assistant">
        <mat-icon>smart_toy</mat-icon>
      </button>

      <!-- Chat Window -->
      <mat-card *ngIf="isExpanded" class="chat-window">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>smart_toy</mat-icon>
            AI Assistant
          </mat-card-title>
          <button mat-icon-button (click)="toggleChat()">
            <mat-icon>close</mat-icon>
          </button>
        </mat-card-header>

        <mat-card-content>
          <div class="messages-container">
            <div 
              *ngFor="let message of messages" 
              class="message"
              [class.user-message]="message.sender === 'user'"
              [class.ai-message]="message.sender === 'ai'">
              <mat-icon *ngIf="message.sender === 'ai'">smart_toy</mat-icon>
              <div class="message-bubble">
                <p>{{ message.text }}</p>
                <small>{{ message.timestamp | date:'short' }}</small>
              </div>
            </div>
            
            <div *ngIf="isTyping" class="typing-indicator">
              <mat-spinner diameter="16"></mat-spinner>
              <span>AI is thinking...</span>
            </div>
          </div>

          <div class="quick-actions" *ngIf="quickActions.length > 0">
            <mat-chip 
              *ngFor="let action of quickActions" 
              (click)="sendQuickAction(action)">
              {{ action }}
            </mat-chip>
          </div>

          <div class="input-area">
            <mat-form-field appearance="outline" class="message-input">
              <input 
                matInput 
                [(ngModel)]="currentMessage"
                (keyup.enter)="sendMessage()"
                placeholder="Ask me anything..."
                [disabled]="isTyping">
              <mat-icon matSuffix>chat</mat-icon>
            </mat-form-field>
            <button 
              mat-icon-button 
              color="primary" 
              (click)="sendMessage()"
              [disabled]="!currentMessage.trim() || isTyping">
              <mat-icon>send</mat-icon>
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .ai-chatbot {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
    }

    .chat-fab {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      50% {
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.6);
      }
      100% {
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
    }

    .chat-window {
      width: 380px;
      height: 500px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    mat-card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 18px;
      }

      button {
        color: white;
      }
    }

    mat-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f5f5f5;
      min-height: 250px;
    }

    .message {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      animation: fadeIn 0.3s ease-in;

      &.user-message {
        justify-content: flex-end;

        .message-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 18px 18px 4px 18px;
        }
      }

      &.ai-message {
        .message-bubble {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 18px 18px 18px 4px;
        }

        mat-icon {
          color: #667eea;
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .message-bubble {
        max-width: 70%;
        padding: 10px 14px;

        p {
          margin: 0 0 4px;
          font-size: 14px;
          line-height: 1.4;
        }

        small {
          font-size: 11px;
          opacity: 0.7;
        }
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      padding: 8px;
    }

    .quick-actions {
      padding: 8px 16px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      border-top: 1px solid #e0e0e0;
      background: white;

      mat-chip {
        cursor: pointer;
        font-size: 12px;
        height: 28px;
        
        &:hover {
          background: #f0f0f0;
        }
      }
    }

    .input-area {
      display: flex;
      align-items: center;
      padding: 12px;
      background: white;
      border-top: 1px solid #e0e0e0;

      .message-input {
        flex: 1;
        margin: 0;

        ::ng-deep .mat-form-field-wrapper {
          padding: 0;
        }
      }

      button {
        margin-left: 8px;
      }
    }

    @media (max-width: 480px) {
      .chat-window {
        width: calc(100vw - 32px);
        height: calc(100vh - 100px);
      }
    }
  `]
})
export class AiChatbotComponent implements OnInit, OnDestroy {
  @Input() context: string = 'general';
  @Input() quickActions: string[] = [];
  
  isExpanded = false;
  messages: ChatMessage[] = [];
  currentMessage = '';
  isTyping = false;
  
  private destroy$ = new Subject<void>();
  private readonly API_URL = 'http://localhost:5001/api';
  
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.initializeChat();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  initializeChat(): void {
    const welcomeMessages: { [key: string]: string } = {
      categories: 'Hello! I can help you manage event categories. Ask me about creating categories, analyzing performance, or getting suggestions!',
      general: 'Hi! I\'m your AI assistant. How can I help you today?',
      events: 'Welcome! I can help you with event planning, scheduling, and management.',
      dashboard: 'Hello! I can provide insights about your dashboard data and help you navigate the system.'
    };
    
    this.messages = [{
      text: welcomeMessages[this.context] || welcomeMessages['general'],
      sender: 'ai',
      timestamp: new Date()
    }];
  }
  
  toggleChat(): void {
    this.isExpanded = !this.isExpanded;
  }
  
  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isTyping) return;
    
    // Add user message
    this.messages.push({
      text: this.currentMessage,
      sender: 'user',
      timestamp: new Date()
    });
    
    const message = this.currentMessage;
    this.currentMessage = '';
    this.isTyping = true;
    
    // Send to backend
    this.http.post<any>(`${this.API_URL}/ai/chat`, {
      message,
      context: this.context
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.messages.push({
            text: response.data.response,
            sender: 'ai',
            timestamp: new Date(response.data.timestamp)
          });
        } else {
          this.showError();
        }
        this.isTyping = false;
        this.scrollToBottom();
      },
      error: () => {
        this.showError();
        this.isTyping = false;
      }
    });
  }
  
  sendQuickAction(action: string): void {
    this.currentMessage = action;
    this.sendMessage();
  }
  
  private showError(): void {
    this.messages.push({
      text: 'Sorry, I encountered an error. Please try again later.',
      sender: 'ai',
      timestamp: new Date()
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
}