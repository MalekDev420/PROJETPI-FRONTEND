import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  department?: string;
  studentId?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatDividerModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  users: User[] = [];
  dataSource = new MatTableDataSource<User>([]);
  displayedColumns: string[] = [
    'name',
    'email',
    'role',
    'department',
    'status',
    'lastLogin',
    'actions'
  ];

  loading = false;
  searchTerm = '';
  roleFilter = 'all';
  
  stats = {
    total: 0,
    admins: 0,
    teachers: 0,
    students: 0,
    active: 0,
    inactive: 0
  };

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.loading = true;
    
    this.http.get<any>('http://localhost:5001/api/users').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.users = response.data;
          this.applyFilters();
          this.calculateStats();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats = {
      total: this.users.length,
      admins: this.users.filter(u => u.role === 'admin').length,
      teachers: this.users.filter(u => u.role === 'teacher').length,
      students: this.users.filter(u => u.role === 'student').length,
      active: this.users.filter(u => u.isActive).length,
      inactive: this.users.filter(u => !u.isActive).length
    };
  }

  applyFilters(): void {
    let filteredUsers = [...this.users];
    
    // Filter by role
    if (this.roleFilter !== 'all') {
      filteredUsers = filteredUsers.filter(u => u.role === this.roleFilter);
    }
    
    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.studentId && u.studentId.toLowerCase().includes(term))
      );
    }
    
    this.dataSource.data = filteredUsers;
  }

  openUserDialog(user?: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '600px',
      data: user || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (user) {
          this.updateUser(user._id, result);
        } else {
          this.createUser(result);
        }
      }
    });
  }

  createUser(userData: any): void {
    this.http.post('http://localhost:5001/api/users', userData).subscribe({
      next: () => {
        this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.snackBar.open('Error creating user', 'Close', { duration: 3000 });
      }
    });
  }

  updateUser(userId: string, userData: any): void {
    this.http.put(`http://localhost:5001/api/users/${userId}`, userData).subscribe({
      next: () => {
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.snackBar.open('Error updating user', 'Close', { duration: 3000 });
      }
    });
  }

  toggleUserStatus(user: User): void {
    const newStatus = !user.isActive;
    this.http.put(`http://localhost:5001/api/users/${user._id}`, { isActive: newStatus }).subscribe({
      next: () => {
        this.snackBar.open(`User ${newStatus ? 'activated' : 'deactivated'}`, 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        this.snackBar.open('Error updating user status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.http.delete(`http://localhost:5001/api/users/${user._id}`).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  resetPassword(user: User): void {
    if (confirm(`Reset password for ${user.firstName} ${user.lastName}?`)) {
      // In a real app, this would send a password reset email
      this.snackBar.open('Password reset email sent', 'Close', { duration: 3000 });
    }
  }

  exportUsers(): void {
    const csv = this.convertToCSV(this.dataSource.data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  convertToCSV(data: User[]): string {
    const headers = ['Name', 'Email', 'Role', 'Department', 'Status', 'Last Login'];
    const rows = data.map(u => [
      `${u.firstName} ${u.lastName}`,
      u.email,
      u.role,
      u.department || '',
      u.isActive ? 'Active' : 'Inactive',
      u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return 'warn';
      case 'teacher': return 'primary';
      case 'student': return 'accent';
      default: return '';
    }
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'admin': return 'admin_panel_settings';
      case 'teacher': return 'school';
      case 'student': return 'person';
      default: return 'person';
    }
  }

  getAvatarColor(user: User): string {
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7',
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
      '#009688', '#4caf50', '#8bc34a', '#cddc39',
      '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
    ];
    const index = (user.firstName.charCodeAt(0) + user.lastName.charCodeAt(0)) % colors.length;
    return colors[index];
  }
}

// User Dialog Component
@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule
  ],
  template: `
    <h2 mat-dialog-title>{{data ? 'Edit User' : 'Create User'}}</h2>
    <mat-dialog-content>
      <form [formGroup]="userForm">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName" required>
            <mat-error>First name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName" required>
            <mat-error>Last name is required</mat-error>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" required>
          <mat-error>Valid email is required</mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role" required>
              <mat-option value="admin">Admin</mat-option>
              <mat-option value="teacher">Teacher</mat-option>
              <mat-option value="student">Student</mat-option>
            </mat-select>
            <mat-error>Role is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Department</mat-label>
            <input matInput formControlName="department">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" *ngIf="userForm.get('role')?.value === 'student'">
          <mat-label>Student ID</mat-label>
          <input matInput formControlName="studentId">
        </mat-form-field>

        <mat-slide-toggle formControlName="isActive">Active</mat-slide-toggle>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="!userForm.valid"
              (click)="save()">
        {{data ? 'Update' : 'Create'}}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 20px;
      min-width: 500px;
    }

    .form-row {
      display: flex;
      gap: 16px;

      mat-form-field {
        flex: 1;
      }
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-slide-toggle {
      margin-bottom: 16px;
    }
  `]
})
export class UserDialogComponent {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User | null
  ) {
    this.userForm = this.fb.group({
      firstName: [data?.firstName || '', Validators.required],
      lastName: [data?.lastName || '', Validators.required],
      email: [data?.email || '', [Validators.required, Validators.email]],
      role: [data?.role || 'student', Validators.required],
      department: [data?.department || ''],
      studentId: [data?.studentId || ''],
      isActive: [data?.isActive ?? true]
    });
  }

  save(): void {
    if (this.userForm.valid) {
      this.dialogRef.close(this.userForm.value);
    }
  }
}