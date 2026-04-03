import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, map, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryDto } from '../../core/models/category-dto';
import { ProductDto } from '../../core/models/product-dto';
import { buildProductForm } from '../../core/forms/form-factories';
import { MediaService } from '../../core/services/media.service';
import { ProductService } from '../../core/services/product.service';
import { CategoryStore } from '../../core/store/category.store';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormComponent implements OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly categoryStore = inject(CategoryStore);
  private readonly mediaService = inject(MediaService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = buildProductForm(this.fb);
  readonly categories = this.categoryStore.categories;
  readonly categoriesLoading = computed(() => this.categoryStore.loading());
  readonly loadError = computed(() => this.categoryStore.error());
  readonly submitError = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly previewUrl = signal<string | null>(null);
  readonly isEditMode = signal(false);

  private currentObjectUrl: string | null = null;
  private selectedFile: File | null = null;
  private productId: number | null = null;

  constructor() {
    this.categoryStore.loadCategories();
    this.initMode();
  }

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile = file;
    this.revokePreviewUrl();

    if (!file) {
      this.previewUrl.set(null);
      return;
    }

    this.currentObjectUrl = URL.createObjectURL(file);
    this.previewUrl.set(this.currentObjectUrl);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.submitError.set(null);

    const rawValue = this.form.getRawValue();
    const productPayload: ProductDto = {
      name: rawValue.name.trim(),
      description: rawValue.description?.trim() || undefined,
      price: rawValue.price,
      stockQuantity: rawValue.stockQuantity,
      imageUrl: rawValue.imageUrl || undefined,
      categoryId: rawValue.categoryId
    };

    const save$ = this.selectedFile
      ? this.mediaService.uploadImage(this.selectedFile).pipe(
          map((imageUrl) => ({ ...productPayload, imageUrl }))
        )
      : of(productPayload);

    const request$ = save$.pipe(
      switchMap((dto) =>
        this.isEditMode() && this.productId != null
          ? this.productService.update(this.productId, dto)
          : this.productService.create(dto)
      ),
      finalize(() => this.isSaving.set(false)),
      takeUntilDestroyed(this.destroyRef)
    );

    request$.subscribe({
      next: () => {
        this.revokePreviewUrl();
        this.router.navigate(['/dashboard/products']);
      },
      error: (err) => {
        this.submitError.set(err?.error?.message || 'Unable to save product. Please try again.');
      }
    });
  }

  private initMode(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const idParam = params.get('id');
        if (!idParam) {
          this.isEditMode.set(false);
          this.productId = null;
          return;
        }

        const id = Number(idParam);
        if (Number.isNaN(id)) {
          return;
        }

        this.isEditMode.set(true);
        this.productId = id;

        this.productService.getById(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (product) => {
              this.form.patchValue({
                name: product.name,
                description: product.description ?? null,
                price: product.price,
                stockQuantity: product.stockQuantity,
                imageUrl: product.imageUrl ?? null,
                categoryId: product.categoryId
              });

              if (product.imageUrl) {
                this.previewUrl.set(product.imageUrl);
              }
            },
            error: () => {
              this.submitError.set('Unable to load product for editing.');
            }
          });
      });
  }

  private revokePreviewUrl(): void {
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
  }
}