import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserDto } from '../../core/models/user-dto';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent {
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly users = signal<UserDto[]>([]);

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService
      .getAll({ page: 0, size: 100 })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (page) => this.users.set(page.content ?? []),
        error: () => this.error.set('Unable to load users right now.')
      });
  }
}
