import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

export interface Notification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  relatedEvent?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:5001/api/notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Poll for new notifications every 30 seconds
    this.startPolling();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  startPolling(): void {
    // Initial load
    this.loadNotifications().subscribe();
    
    // Poll every 30 seconds
    interval(30000).pipe(
      switchMap(() => this.loadNotifications())
    ).subscribe();
  }

  loadNotifications(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.notificationsSubject.next(response.data);
          const unreadCount = response.data.filter((n: Notification) => !n.isRead).length;
          this.unreadCountSubject.next(unreadCount);
        }
      })
    );
  }

  getNotifications(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { 
      headers: this.getHeaders(),
      params 
    });
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${notificationId}/read`, 
      {},
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => {
        // Update local state
        const notifications = this.notificationsSubject.value;
        const index = notifications.findIndex(n => n._id === notificationId);
        if (index !== -1) {
          notifications[index].isRead = true;
          this.notificationsSubject.next(notifications);
          const unreadCount = notifications.filter(n => !n.isRead).length;
          this.unreadCountSubject.next(unreadCount);
        }
      })
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/mark-all-read`, 
      {},
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => {
        // Update local state
        const notifications = this.notificationsSubject.value;
        notifications.forEach(n => n.isRead = true);
        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(0);
      })
    );
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${notificationId}`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => {
        // Update local state
        const notifications = this.notificationsSubject.value;
        const filtered = notifications.filter(n => n._id !== notificationId);
        this.notificationsSubject.next(filtered);
        const unreadCount = filtered.filter(n => !n.isRead).length;
        this.unreadCountSubject.next(unreadCount);
      })
    );
  }

  clearAll(): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/clear-all`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => {
        // Clear local state
        this.notificationsSubject.next([]);
        this.unreadCountSubject.next(0);
      })
    );
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }
}