import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../core/services/toast.service';
import { CategoryDto } from '../../core/models/category-dto';
import { CategoryStore } from '../../core/store/category.store';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryManagementComponent {
  private readonly categoryStore = inject(CategoryStore);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = this.categoryStore.categories;
  readonly loading = this.categoryStore.loading;
  readonly error = this.categoryStore.error;

  readonly showCreateForm = signal(false);
  readonly createSubmitting = signal(false);
  readonly updateSubmitting = signal(false);

  readonly editingCategory = signal<CategoryDto | null>(null);

  readonly createForm = this.fb.group({
    name: this.fb.control('', { validators: [Validators.required, Validators.maxLength(150)] }),
    description: this.fb.control<string | null>(null)
  });

  readonly editForm = this.fb.group({
    name: this.fb.control('', { validators: [Validators.required, Validators.maxLength(150)] }),
    description: this.fb.control<string | null>(null)
  });

  constructor() {
    this.categoryStore.loadCategories(true);
  }

  displaySlug(category: CategoryDto): string {
    if (category.slug && category.slug.trim().length > 0) {
      return category.slug;
    }
    const base = (category.name || '').trim().toLowerCase();
    return base.replace(/\s+/g, '-');
  }

  toggleCreate(): void {
    this.showCreateForm.update((v) => !v);
  }

  onCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.createSubmitting.set(true);

    const value = this.createForm.getRawValue();
    const payload: CategoryDto = {
      name: value.name.trim(),
      description: value.description?.trim() || undefined
    };

    this.categoryStore
      .createCategory(payload)
      .pipe(
        finalize(() => this.createSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toast.success('Category created.');
          this.createForm.reset();
          this.showCreateForm.set(false);
        },
        error: () => {
          this.toast.error('Unable to create category.');
        }
      });
  }

  startEdit(category: CategoryDto): void {
    this.editingCategory.set(category);
    this.editForm.reset({
      name: category.name,
      description: category.description ?? null
    });
  }

  cancelEdit(): void {
    this.editingCategory.set(null);
    this.editForm.reset();
  }

  onUpdate(): void {
    const current = this.editingCategory();
    if (!current || current.id == null) {
      return;
    }
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.updateSubmitting.set(true);

    const value = this.editForm.getRawValue();
    const payload: CategoryDto = {
      name: value.name.trim(),
      description: value.description?.trim() || undefined
    };

    this.categoryStore
      .updateCategory(current.id, payload)
      .pipe(
        finalize(() => this.updateSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toast.success('Category updated.');
          this.editingCategory.set(null);
        },
        error: () => {
          this.toast.error('Unable to update category.');
        }
      });
  }

  deleteCategory(category: CategoryDto): void {
    if (category.id == null) {
      return;
    }

    this.categoryStore
      .deleteCategory(category.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('Category deleted.');
        },
        error: () => {
          this.toast.error('Unable to delete category.');
        }
      });
  }
}
