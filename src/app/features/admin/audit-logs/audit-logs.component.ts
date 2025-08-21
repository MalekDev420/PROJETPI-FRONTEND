import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClient } from '@angular/common/http';

interface AuditLog {
  _id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details: any;
  status: 'success' | 'failure' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatExpansionModule
  ],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss']
})
export class AuditLogsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  logs: AuditLog[] = [];
  dataSource = new MatTableDataSource<AuditLog>([]);
  displayedColumns: string[] = [
    'timestamp',
    'user',
    'action',
    'entity',
    'status',
    'severity',
    'ipAddress',
    'details'
  ];
  expandedLog: AuditLog | null = null;

  loading = false;
  searchTerm = '';
  selectedEntity = 'all';
  selectedAction = 'all';
  selectedStatus = 'all';
  selectedSeverity = 'all';
  startDate: Date = new Date(new Date().setDate(new Date().getDate() - 7));
  endDate: Date = new Date();

  // Filter options
  entities = ['all', 'user', 'event', 'category', 'registration', 'system'];
  actions = ['all', 'create', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'export'];
  statuses = ['all', 'success', 'failure', 'warning'];
  severities = ['all', 'low', 'medium', 'high', 'critical'];

  // Statistics
  stats = {
    total: 0,
    today: 0,
    failures: 0,
    criticalEvents: 0,
    uniqueUsers: 0,
    mostActiveUser: ''
  };

  // Activity summary
  activitySummary: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom sorting for timestamp
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch(property) {
        case 'timestamp': return new Date(item.timestamp).getTime();
        default: return (item as any)[property];
      }
    };
  }

  loadAuditLogs(): void {
    this.loading = true;
    
    const params = {
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      entity: this.selectedEntity,
      action: this.selectedAction,
      status: this.selectedStatus,
      severity: this.selectedSeverity
    };

    this.http.get<any>('http://localhost:5001/api/audit-logs', { params }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.logs = response.data;
          this.applyFilters();
          this.calculateStats();
          this.generateActivitySummary();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        // Load mock data for demonstration
        this.loadMockData();
        this.loading = false;
      }
    });
  }

  loadMockData(): void {
    const mockLogs: AuditLog[] = [];
    const users = [
      { id: '1', name: 'John Smith', role: 'admin' },
      { id: '2', name: 'Emily Johnson', role: 'teacher' },
      { id: '3', name: 'Michael Brown', role: 'student' },
      { id: '4', name: 'Sarah Davis', role: 'admin' }
    ];

    const actions = [
      { action: 'create', entity: 'event', status: 'success', severity: 'low' },
      { action: 'update', entity: 'user', status: 'success', severity: 'low' },
      { action: 'delete', entity: 'event', status: 'success', severity: 'medium' },
      { action: 'login', entity: 'system', status: 'success', severity: 'low' },
      { action: 'logout', entity: 'system', status: 'success', severity: 'low' },
      { action: 'approve', entity: 'event', status: 'success', severity: 'medium' },
      { action: 'reject', entity: 'event', status: 'warning', severity: 'medium' },
      { action: 'export', entity: 'system', status: 'success', severity: 'low' },
      { action: 'login', entity: 'system', status: 'failure', severity: 'high' },
      { action: 'delete', entity: 'user', status: 'failure', severity: 'critical' }
    ];

    // Generate mock logs
    for (let i = 0; i < 100; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const actionData = actions[Math.floor(Math.random() * actions.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 7));
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));

      mockLogs.push({
        _id: `log_${i + 1}`,
        action: actionData.action,
        entity: actionData.entity,
        entityId: `${actionData.entity}_${Math.floor(Math.random() * 100)}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        timestamp: date,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        details: this.generateMockDetails(actionData.action, actionData.entity),
        status: actionData.status as 'success' | 'failure' | 'warning',
        severity: actionData.severity as 'low' | 'medium' | 'high' | 'critical'
      });
    }

    this.logs = mockLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    this.applyFilters();
    this.calculateStats();
    this.generateActivitySummary();
  }

  generateMockDetails(action: string, entity: string): any {
    const details: any = {
      action,
      entity,
      timestamp: new Date().toISOString()
    };

    switch (action) {
      case 'create':
        details.message = `Created new ${entity}`;
        details.newValues = { name: `New ${entity}`, status: 'active' };
        break;
      case 'update':
        details.message = `Updated ${entity}`;
        details.changes = { 
          before: { status: 'inactive' }, 
          after: { status: 'active' } 
        };
        break;
      case 'delete':
        details.message = `Deleted ${entity}`;
        details.deletedItem = { id: entity + '_123', name: `Deleted ${entity}` };
        break;
      case 'login':
        details.message = 'User logged in';
        details.sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        break;
      case 'logout':
        details.message = 'User logged out';
        details.sessionDuration = Math.floor(Math.random() * 3600) + ' seconds';
        break;
      case 'approve':
        details.message = `Approved ${entity}`;
        details.approvedItem = { id: entity + '_456', name: `Approved ${entity}` };
        break;
      case 'reject':
        details.message = `Rejected ${entity}`;
        details.reason = 'Does not meet requirements';
        break;
      case 'export':
        details.message = 'Exported data';
        details.format = 'CSV';
        details.recordCount = Math.floor(Math.random() * 1000);
        break;
    }

    return details;
  }

  calculateStats(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.stats = {
      total: this.logs.length,
      today: this.logs.filter(log => new Date(log.timestamp) >= today).length,
      failures: this.logs.filter(log => log.status === 'failure').length,
      criticalEvents: this.logs.filter(log => log.severity === 'critical').length,
      uniqueUsers: new Set(this.logs.map(log => log.userId)).size,
      mostActiveUser: this.getMostActiveUser()
    };
  }

  getMostActiveUser(): string {
    const userCounts = this.logs.reduce((acc, log) => {
      acc[log.userName] = (acc[log.userName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActive = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0];
    return mostActive ? `${mostActive[0]} (${mostActive[1]} actions)` : 'N/A';
  }

  generateActivitySummary(): void {
    const summary = this.logs.reduce((acc, log) => {
      const key = `${log.action}_${log.entity}`;
      if (!acc[key]) {
        acc[key] = {
          action: log.action,
          entity: log.entity,
          count: 0,
          successCount: 0,
          failureCount: 0
        };
      }
      acc[key].count++;
      if (log.status === 'success') acc[key].successCount++;
      if (log.status === 'failure') acc[key].failureCount++;
      return acc;
    }, {} as Record<string, any>);

    this.activitySummary = Object.values(summary)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  applyFilters(): void {
    let filteredLogs = [...this.logs];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredLogs = filteredLogs.filter(log =>
        log.userName.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        log.entity.toLowerCase().includes(term) ||
        log.ipAddress.includes(term)
      );
    }

    // Apply entity filter
    if (this.selectedEntity !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.entity === this.selectedEntity);
    }

    // Apply action filter
    if (this.selectedAction !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.action === this.selectedAction);
    }

    // Apply status filter
    if (this.selectedStatus !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.status === this.selectedStatus);
    }

    // Apply severity filter
    if (this.selectedSeverity !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.severity === this.selectedSeverity);
    }

    this.dataSource.data = filteredLogs;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onDateChange(): void {
    this.loadAuditLogs();
  }

  exportLogs(format: string): void {
    if (format === 'csv') {
      this.exportCSV();
    } else if (format === 'json') {
      this.exportJSON();
    }
  }

  exportCSV(): void {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Entity', 'Status', 'Severity', 'IP Address'];
    const rows = this.dataSource.data.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.userName,
      log.userRole,
      log.action,
      log.entity,
      log.status,
      log.severity,
      log.ipAddress
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportJSON(): void {
    const json = JSON.stringify(this.dataSource.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getActionIcon(action: string): string {
    const icons: any = {
      'create': 'add_circle',
      'update': 'edit',
      'delete': 'delete',
      'login': 'login',
      'logout': 'logout',
      'approve': 'check_circle',
      'reject': 'cancel',
      'export': 'download'
    };
    return icons[action] || 'info';
  }

  getActionColor(action: string): string {
    const colors: any = {
      'create': '#4caf50',
      'update': '#2196f3',
      'delete': '#f44336',
      'login': '#9c27b0',
      'logout': '#ff9800',
      'approve': '#4caf50',
      'reject': '#ff5722',
      'export': '#00bcd4'
    };
    return colors[action] || '#666';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'success': return 'primary';
      case 'failure': return 'warn';
      case 'warning': return 'accent';
      default: return '';
    }
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'report';
      default: return 'info';
    }
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#ff5722';
      case 'critical': return '#f44336';
      default: return '#666';
    }
  }
}