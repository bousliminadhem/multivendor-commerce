import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../core/models/register-request';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['CUSTOMER' as 'CUSTOMER' | 'VENDOR', [Validators.required]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    const [firstName, ...rest] = raw.name.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;

    const payload: RegisterRequest = {
      firstName,
      lastName,
      email: raw.email,
      password: raw.password,
      role: raw.role
    };

    this.authService.register(payload).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.loading.set(false);
        const message = err?.error?.message || 'Unable to register right now. Please try again.';
        this.error.set(message);
      }
    });
  }
}
