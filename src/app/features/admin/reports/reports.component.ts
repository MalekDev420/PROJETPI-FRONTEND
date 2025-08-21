import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ReportData {
  eventsByCategory: { category: string; count: number }[];
  eventsByMonth: { month: string; count: number }[];
  registrationTrends: { date: string; registrations: number }[];
  userActivity: { date: string; activeUsers: number }[];
  popularEvents: { title: string; registrations: number; category: string }[];
  departmentStats: { department: string; students: number; teachers: number }[];
  eventSuccess: { successful: number; cancelled: number; total: number }[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  @ViewChild('eventsPaginator') eventsPaginator!: MatPaginator;
  @ViewChild('usersPaginator') usersPaginator!: MatPaginator;

  loading = false;
  selectedTab = 0;
  reportPeriod = '30days';
  startDate: Date = new Date(new Date().setMonth(new Date().getMonth() - 1));
  endDate: Date = new Date();

  // Charts
  categoryChart: any;
  trendChart: any;
  registrationChart: any;
  departmentChart: any;

  // Summary Stats
  stats = {
    totalEvents: 0,
    totalRegistrations: 0,
    averageAttendance: 0,
    eventCompletionRate: 0,
    activeUsers: 0,
    newUsers: 0,
    userGrowthRate: 0,
    topCategory: '',
    upcomingEvents: 0,
    pastEvents: 0
  };

  // Table Data
  popularEventsData = new MatTableDataSource<any>([]);
  topOrganizersData = new MatTableDataSource<any>([]);
  
  popularEventsColumns = ['rank', 'title', 'category', 'organizer', 'registrations', 'date'];
  topOrganizersColumns = ['rank', 'name', 'eventsCreated', 'totalRegistrations', 'successRate'];

  periods = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 3 Months' },
    { value: '180days', label: 'Last 6 Months' },
    { value: '365days', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Don't load reports here, wait for view to be initialized
  }

  ngAfterViewInit() {
    this.popularEventsData.paginator = this.eventsPaginator;
    this.topOrganizersData.paginator = this.usersPaginator;
    // Load reports after view is initialized so chart canvases are available
    setTimeout(() => {
      this.loadReports();
    }, 100);
  }

  loadReports(): void {
    this.loading = true;
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Set headers with authentication
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    // Prepare date parameters
    const params = {
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString()
    };

    // Load summary statistics
    this.http.get<any>('http://localhost:5001/api/stats/reports', { headers, params }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.processReportData(response.data);
          this.createCharts(response.data);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        // Use mock data for demonstration
        this.loadMockData();
        this.loading = false;
      }
    });
  }

  processReportData(data: any): void {
    // Process summary statistics
    this.stats = {
      totalEvents: data.totalEvents || 0,
      totalRegistrations: data.totalRegistrations || 0,
      averageAttendance: data.averageAttendance || 0,
      eventCompletionRate: data.eventCompletionRate || 0,
      activeUsers: data.activeUsers || 0,
      newUsers: data.newUsers || 0,
      userGrowthRate: data.userGrowthRate || 0,
      topCategory: data.topCategory || 'Academic',
      upcomingEvents: data.upcomingEvents || 0,
      pastEvents: data.pastEvents || 0
    };

    // Process table data
    this.popularEventsData.data = data.popularEvents || [];
    this.topOrganizersData.data = data.topOrganizers || [];
  }

  createCharts(data: any): void {
    // Events by Category Pie Chart
    this.createCategoryChart(data.eventsByCategory || this.getMockCategoryData());
    
    // Registration Trends Line Chart
    this.createTrendChart(data.registrationTrends || this.getMockTrendData());
    
    // Monthly Events Bar Chart
    this.createMonthlyChart(data.eventsByMonth || this.getMockMonthlyData());
    
    // Department Distribution Chart
    this.createDepartmentChart(data.departmentStats || this.getMockDepartmentData());
  }

  createCategoryChart(data: any[]): void {
    const canvas = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Category chart canvas not found');
      return;
    }

    // Destroy existing chart if it exists
    if (this.categoryChart) {
      this.categoryChart.destroy();
      this.categoryChart = null;
    }

    // Get 2D context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context for category chart');
      return;
    }

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.category),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384',
            '#C9CBCF'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Events by Category'
          }
        }
      }
    });
  }

  createTrendChart(data: any[]): void {
    const canvas = document.getElementById('trendChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Trend chart canvas not found');
      return;
    }

    if (this.trendChart) {
      this.trendChart.destroy();
      this.trendChart = null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context for trend chart');
      return;
    }

    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: 'Registrations',
          data: data.map(d => d.registrations),
          borderColor: '#3f51b5',
          backgroundColor: 'rgba(63, 81, 181, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Registration Trends'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  createMonthlyChart(data: any[]): void {
    const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Monthly chart canvas not found');
      return;
    }

    if (this.registrationChart) {
      this.registrationChart.destroy();
      this.registrationChart = null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context for monthly chart');
      return;
    }

    this.registrationChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.month),
        datasets: [{
          label: 'Events',
          data: data.map(d => d.count),
          backgroundColor: '#4CAF50'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Events by Month'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  createDepartmentChart(data: any[]): void {
    const canvas = document.getElementById('departmentChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Department chart canvas not found');
      return;
    }

    if (this.departmentChart) {
      this.departmentChart.destroy();
      this.departmentChart = null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context for department chart');
      return;
    }

    this.departmentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.department),
        datasets: [
          {
            label: 'Students',
            data: data.map(d => d.students),
            backgroundColor: '#9C27B0'
          },
          {
            label: 'Teachers',
            data: data.map(d => d.teachers),
            backgroundColor: '#2196F3'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Users by Department'
          }
        },
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            beginAtZero: true
          }
        }
      }
    });
  }

  onPeriodChange(): void {
    if (this.reportPeriod !== 'custom') {
      const days = parseInt(this.reportPeriod);
      this.endDate = new Date();
      this.startDate = new Date();
      this.startDate.setDate(this.startDate.getDate() - days);
    }
    this.loadReports();
  }

  exportReport(format: string): void {
    switch (format) {
      case 'pdf':
        this.exportPDF();
        break;
      case 'excel':
        this.exportExcel();
        break;
      case 'csv':
        this.exportCSV();
        break;
    }
  }

  exportPDF(): void {
    console.log('Exporting PDF report...');
    // Implementation would use a library like jsPDF
  }

  exportExcel(): void {
    console.log('Exporting Excel report...');
    // Implementation would use a library like xlsx
  }

  exportCSV(): void {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Events', this.stats.totalEvents],
      ['Total Registrations', this.stats.totalRegistrations],
      ['Average Attendance', this.stats.averageAttendance],
      ['Active Users', this.stats.activeUsers],
      ['New Users', this.stats.newUsers],
      ['Upcoming Events', this.stats.upcomingEvents],
      ['Past Events', this.stats.pastEvents]
    ];
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Mock data methods for demonstration
  loadMockData(): void {
    const mockData = {
      totalEvents: 156,
      totalRegistrations: 3428,
      averageAttendance: 22,
      eventCompletionRate: 87,
      activeUsers: 1250,
      newUsers: 89,
      userGrowthRate: 7.6,
      topCategory: 'Academic',
      upcomingEvents: 23,
      pastEvents: 133,
      popularEvents: this.getMockPopularEvents(),
      topOrganizers: this.getMockTopOrganizers()
    };

    this.processReportData(mockData);
    this.createCharts(mockData);
  }

  getMockCategoryData() {
    return [
      { category: 'Academic', count: 45 },
      { category: 'Workshop', count: 32 },
      { category: 'Seminar', count: 28 },
      { category: 'Social', count: 18 },
      { category: 'Career', count: 15 },
      { category: 'Sports', count: 10 },
      { category: 'Cultural', count: 8 }
    ];
  }

  getMockTrendData() {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        registrations: Math.floor(Math.random() * 100) + 50
      });
    }
    return data;
  }

  getMockMonthlyData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      count: Math.floor(Math.random() * 30) + 10
    }));
  }

  getMockDepartmentData() {
    return [
      { department: 'Computer Science', students: 245, teachers: 18 },
      { department: 'Business', students: 189, teachers: 15 },
      { department: 'Engineering', students: 167, teachers: 12 },
      { department: 'Arts', students: 134, teachers: 10 },
      { department: 'Sciences', students: 156, teachers: 14 }
    ];
  }

  getMockPopularEvents() {
    return [
      { rank: 1, title: 'AI Workshop 2024', category: 'Workshop', organizer: 'Dr. Smith', registrations: 145, date: new Date() },
      { rank: 2, title: 'Career Fair', category: 'Career', organizer: 'Career Center', registrations: 132, date: new Date() },
      { rank: 3, title: 'Tech Summit', category: 'Seminar', organizer: 'Tech Club', registrations: 118, date: new Date() },
      { rank: 4, title: 'Spring Festival', category: 'Cultural', organizer: 'Student Union', registrations: 105, date: new Date() },
      { rank: 5, title: 'Research Symposium', category: 'Academic', organizer: 'Dr. Johnson', registrations: 98, date: new Date() }
    ];
  }

  getMockTopOrganizers() {
    return [
      { rank: 1, name: 'Dr. Emily Smith', eventsCreated: 12, totalRegistrations: 428, successRate: 92 },
      { rank: 2, name: 'Tech Club', eventsCreated: 10, totalRegistrations: 385, successRate: 88 },
      { rank: 3, name: 'Student Union', eventsCreated: 9, totalRegistrations: 356, successRate: 95 },
      { rank: 4, name: 'Dr. Michael Johnson', eventsCreated: 8, totalRegistrations: 312, successRate: 87 },
      { rank: 5, name: 'Career Center', eventsCreated: 7, totalRegistrations: 289, successRate: 91 }
    ];
  }

  getGrowthIcon(value: number): string {
    return value > 0 ? 'trending_up' : value < 0 ? 'trending_down' : 'trending_flat';
  }

  getGrowthColor(value: number): string {
    return value > 0 ? 'success' : value < 0 ? 'warn' : 'normal';
  }

  ngOnDestroy(): void {
    // Clean up charts when component is destroyed
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
    if (this.trendChart) {
      this.trendChart.destroy();
    }
    if (this.registrationChart) {
      this.registrationChart.destroy();
    }
    if (this.departmentChart) {
      this.departmentChart.destroy();
    }
  }
}