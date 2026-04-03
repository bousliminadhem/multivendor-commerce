import { Injectable, inject, signal } from '@angular/core';
import { CategoryDto } from '../models/category-dto';
import { CategoryService } from '../services/category.service';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryStore {
  private readonly categoryService = inject(CategoryService);

  private readonly categoriesState = signal<CategoryDto[]>([]);
  private readonly loadingState = signal(false);
  private readonly loadedState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly categories = this.categoriesState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly loaded = this.loadedState.asReadonly();
  readonly error = this.errorState.asReadonly();

  loadCategories(force = false): void {
    if (this.loadedState() && !force) {
      return;
    }

    this.loadingState.set(true);
    this.errorState.set(null);

    this.categoryService.getAll({ page: 0, size: 200 }).subscribe({
      next: (page) => {
        this.categoriesState.set(page.content ?? []);
        this.loadedState.set(true);
      },
      error: () => {
        this.errorState.set('Unable to load categories right now.');
      },
      complete: () => {
        this.loadingState.set(false);
      }
    });
  }

  createCategory(dto: CategoryDto) {
    return this.categoryService.create(dto).pipe(
      tap((created) => {
        this.categoriesState.update((current) => [...current, created]);
      })
    );
  }

  updateCategory(id: number, dto: CategoryDto) {
    return this.categoryService.update(id, dto).pipe(
      tap((updated) => {
        this.categoriesState.update((current) =>
          current.map((category) => (category.id === id ? updated : category))
        );
      })
    );
  }

  deleteCategory(id: number) {
    return this.categoryService.delete(id).pipe(
      tap(() => {
        this.categoriesState.update((current) => current.filter((category) => category.id !== id));
      })
    );
  }
}
