import { Component, OnInit, ViewChild, Inject } from '@angular/core';
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
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';
import { AiChatbotComponent } from '../../../shared/components/ai-chatbot/ai-chatbot.component';

interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  eventCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-categories',
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
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatDividerModule,
    AiChatbotComponent
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  categories: Category[] = [];
  dataSource = new MatTableDataSource<Category>([]);
  displayedColumns: string[] = [
    'icon',
    'name',
    'description',
    'eventCount',
    'status',
    'createdAt',
    'actions'
  ];

  loading = false;
  searchTerm = '';

  stats = {
    total: 0,
    active: 0,
    inactive: 0,
    totalEvents: 0
  };

  // Available icons for categories
  availableIcons = [
    'school', 'work', 'groups', 'forum', 'build',
    'science', 'sports_basketball', 'theater_comedy',
    'computer', 'business', 'celebration', 'restaurant',
    'music_note', 'palette', 'camera_alt', 'fitness_center',
    'local_library', 'psychology', 'volunteer_activism', 'public'
  ];

  // Available colors for categories
  availableColors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCategories(): void {
    this.loading = true;
    
    // Try to load from API first
    this.http.get<any>('http://localhost:5001/api/categories').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data;
          this.applyFilter();
          this.calculateStats();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // Load mock data for demonstration
        this.loadMockData();
        this.loading = false;
      }
    });
  }

  loadMockData(): void {
    this.categories = [
      {
        _id: '1',
        name: 'Academic',
        description: 'Academic events including lectures, seminars, and research presentations',
        icon: 'school',
        color: '#3f51b5',
        eventCount: 45,
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        _id: '2',
        name: 'Workshop',
        description: 'Hands-on workshops and practical training sessions',
        icon: 'build',
        color: '#ff9800',
        eventCount: 32,
        isActive: true,
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16')
      },
      {
        _id: '3',
        name: 'Social',
        description: 'Social gatherings, networking events, and community activities',
        icon: 'groups',
        color: '#4caf50',
        eventCount: 28,
        isActive: true,
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17')
      },
      {
        _id: '4',
        name: 'Career',
        description: 'Career fairs, job interviews, and professional development',
        icon: 'work',
        color: '#9c27b0',
        eventCount: 15,
        isActive: true,
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18')
      },
      {
        _id: '5',
        name: 'Sports',
        description: 'Sports events, tournaments, and fitness activities',
        icon: 'sports_basketball',
        color: '#f44336',
        eventCount: 10,
        isActive: true,
        createdAt: new Date('2024-01-19'),
        updatedAt: new Date('2024-01-19')
      },
      {
        _id: '6',
        name: 'Cultural',
        description: 'Cultural celebrations, festivals, and artistic performances',
        icon: 'theater_comedy',
        color: '#ff5722',
        eventCount: 8,
        isActive: true,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20')
      },
      {
        _id: '7',
        name: 'Technical',
        description: 'Technical talks, coding competitions, and IT workshops',
        icon: 'computer',
        color: '#00bcd4',
        eventCount: 18,
        isActive: true,
        createdAt: new Date('2024-01-21'),
        updatedAt: new Date('2024-01-21')
      }
    ];
    this.applyFilter();
    this.calculateStats();
  }

  calculateStats(): void {
    this.stats = {
      total: this.categories.length,
      active: this.categories.filter(c => c.isActive).length,
      inactive: this.categories.filter(c => !c.isActive).length,
      totalEvents: this.categories.reduce((sum, c) => sum + c.eventCount, 0)
    };
  }

  applyFilter(): void {
    let filteredCategories = [...this.categories];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredCategories = filteredCategories.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      );
    }
    
    this.dataSource.data = filteredCategories;
  }

  openCategoryDialog(category?: Category): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '600px',
      data: category || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (category) {
          this.updateCategory(category._id, result);
        } else {
          this.createCategory(result);
        }
      }
    });
  }

  createCategory(categoryData: any): void {
    this.http.post('http://localhost:5001/api/categories', categoryData).subscribe({
      next: () => {
        this.snackBar.open('Category created successfully', 'Close', { duration: 3000 });
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error creating category:', error);
        // For demo, add to local array
        const newCategory: Category = {
          _id: Date.now().toString(),
          ...categoryData,
          eventCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.categories.push(newCategory);
        this.applyFilter();
        this.calculateStats();
        this.snackBar.open('Category created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  updateCategory(categoryId: string, categoryData: any): void {
    this.http.put(`http://localhost:5001/api/categories/${categoryId}`, categoryData).subscribe({
      next: () => {
        this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error updating category:', error);
        // For demo, update in local array
        const index = this.categories.findIndex(c => c._id === categoryId);
        if (index !== -1) {
          this.categories[index] = {
            ...this.categories[index],
            ...categoryData,
            updatedAt: new Date()
          };
          this.applyFilter();
          this.calculateStats();
          this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
        }
      }
    });
  }

  toggleCategoryStatus(category: Category): void {
    const newStatus = !category.isActive;
    this.http.put(`http://localhost:5001/api/categories/${category._id}`, { isActive: newStatus }).subscribe({
      next: () => {
        this.snackBar.open(`Category ${newStatus ? 'activated' : 'deactivated'}`, 'Close', { duration: 3000 });
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error updating category status:', error);
        // For demo, update locally
        category.isActive = newStatus;
        this.calculateStats();
        this.snackBar.open(`Category ${newStatus ? 'activated' : 'deactivated'}`, 'Close', { duration: 3000 });
      }
    });
  }

  deleteCategory(category: Category): void {
    if (category.eventCount > 0) {
      this.snackBar.open('Cannot delete category with associated events', 'Close', { duration: 3000 });
      return;
    }

    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.http.delete(`http://localhost:5001/api/categories/${category._id}`).subscribe({
        next: () => {
          this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          // For demo, remove from local array
          const index = this.categories.findIndex(c => c._id === category._id);
          if (index !== -1) {
            this.categories.splice(index, 1);
            this.applyFilter();
            this.calculateStats();
            this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });
          }
        }
      });
    }
  }
}

// Category Dialog Component
@Component({
  selector: 'app-category-dialog',
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
    MatSlideToggleModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>{{data ? 'Edit Category' : 'Create Category'}}</h2>
    <mat-dialog-content>
      <form [formGroup]="categoryForm">
        <mat-form-field appearance="outline">
          <mat-label>Category Name</mat-label>
          <input matInput formControlName="name" required>
          <mat-error>Category name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" required></textarea>
          <mat-error>Description is required</mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Icon</mat-label>
            <mat-select formControlName="icon" required>
              <mat-select-trigger>
                <mat-icon>{{categoryForm.get('icon')?.value}}</mat-icon>
                {{categoryForm.get('icon')?.value}}
              </mat-select-trigger>
              <mat-option *ngFor="let icon of availableIcons" [value]="icon">
                <mat-icon>{{icon}}</mat-icon>
                <span>{{icon}}</span>
              </mat-option>
            </mat-select>
            <mat-error>Icon is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Color</mat-label>
            <mat-select formControlName="color" required>
              <mat-select-trigger>
                <div class="color-preview" [style.background-color]="categoryForm.get('color')?.value"></div>
                {{categoryForm.get('color')?.value}}
              </mat-select-trigger>
              <mat-option *ngFor="let color of availableColors" [value]="color">
                <div class="color-option">
                  <div class="color-preview" [style.background-color]="color"></div>
                  <span>{{color}}</span>
                </div>
              </mat-option>
            </mat-select>
            <mat-error>Color is required</mat-error>
          </mat-form-field>
        </div>

        <div class="preview-section">
          <label>Preview:</label>
          <mat-chip [style.background-color]="categoryForm.get('color')?.value" selected>
            <mat-icon class="chip-icon">{{categoryForm.get('icon')?.value || 'category'}}</mat-icon>
            {{categoryForm.get('name')?.value || 'Category Name'}}
          </mat-chip>
        </div>

        <mat-slide-toggle formControlName="isActive">Active</mat-slide-toggle>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="!categoryForm.valid"
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

    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;

      mat-form-field {
        flex: 1;
      }
    }

    .color-preview {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      display: inline-block;
      margin-right: 8px;
      vertical-align: middle;
      border: 1px solid #ddd;
    }

    .color-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .preview-section {
      margin: 20px 0;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;

      label {
        display: block;
        margin-bottom: 8px;
        color: #666;
        font-size: 12px;
        text-transform: uppercase;
      }

      mat-chip {
        color: white;

        .chip-icon {
          margin-right: 4px !important;
          font-size: 18px !important;
          width: 18px !important;
          height: 18px !important;
        }
      }
    }

    mat-slide-toggle {
      margin-bottom: 16px;
    }

    ::ng-deep {
      .mat-mdc-select-trigger {
        display: flex;
        align-items: center;

        mat-icon {
          margin-right: 8px;
        }
      }

      .mat-mdc-option {
        mat-icon {
          margin-right: 8px;
          vertical-align: middle;
        }
      }
    }
  `]
})
export class CategoryDialogComponent {
  categoryForm: FormGroup;
  availableIcons = [
    'school', 'work', 'groups', 'forum', 'build',
    'science', 'sports_basketball', 'theater_comedy',
    'computer', 'business', 'celebration', 'restaurant',
    'music_note', 'palette', 'camera_alt', 'fitness_center',
    'local_library', 'psychology', 'volunteer_activism', 'public'
  ];

  availableColors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Category | null
  ) {
    this.categoryForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      description: [data?.description || '', Validators.required],
      icon: [data?.icon || 'category', Validators.required],
      color: [data?.color || '#3f51b5', Validators.required],
      isActive: [data?.isActive ?? true]
    });
  }

  save(): void {
    if (this.categoryForm.valid) {
      this.dialogRef.close(this.categoryForm.value);
    }
  }
}