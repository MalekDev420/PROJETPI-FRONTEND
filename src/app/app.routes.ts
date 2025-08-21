import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./features/admin/event-management/event-management.component').then(m => m.EventManagementComponent)
      },
      {
        path: 'events/:id',
        loadComponent: () => import('./features/admin/event-details/event-details.component').then(m => m.EventDetailsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/admin/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./features/admin/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/admin/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'teacher',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['teacher'] },
    loadComponent: () => import('./layouts/teacher-layout/teacher-layout.component').then(m => m.TeacherLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboards/teacher-dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./features/teacher/events-list/events-list.component').then(m => m.EventsListComponent)
      },
      {
        path: 'create-event',
        loadComponent: () => import('./features/teacher/create-event/create-event.component').then(m => m.CreateEventComponent)
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/teacher/calendar/calendar.component').then(m => m.CalendarComponent)
      },
      {
        path: 'attendees',
        loadComponent: () => import('./features/teacher/attendees/attendees.component').then(m => m.AttendeesComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/teacher/analytics/analytics.component').then(m => m.AnalyticsComponent)
      },
      {
        path: 'ai-assistant',
        loadComponent: () => import('./features/teacher/ai-assistant/ai-assistant.component').then(m => m.AiAssistantComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/teacher/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'student',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['student'] },
    loadComponent: () => import('./layouts/student-layout/student-layout.component').then(m => m.StudentLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/student/dashboard/dashboard.component').then(m => m.StudentDashboardComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./features/student/events/events.component').then(m => m.EventsComponent)
      },
      {
        path: 'my-events',
        loadComponent: () => import('./features/student/my-events/my-events.component').then(m => m.MyEventsComponent)
      },
      {
        path: 'calendar',
        loadComponent: () => import('./features/student/calendar/calendar.component').then(m => m.CalendarComponent)
      },
      {
        path: 'certificates',
        loadComponent: () => import('./features/student/certificates/certificates.component').then(m => m.CertificatesComponent)
      },
      {
        path: 'feedback',
        loadComponent: () => import('./features/student/feedback/feedback.component').then(m => m.FeedbackComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/student/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];