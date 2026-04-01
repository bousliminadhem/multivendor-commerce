import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="min-h-[70vh] bg-gradient-to-b from-slate-50 to-white">
      <div class="container-xl flex justify-center py-16 lg:py-20">
        <div class="w-full max-w-xl rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
          <div class="mb-8 space-y-2 text-center">
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-500">Welcome back</p>
            <h1 class="text-3xl font-semibold text-slate-900">Sign in to your account</h1>
            <p class="text-sm text-slate-600">Use your vendor credentials to access the dashboard.</p>
          </div>

          <form class="space-y-6" [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-800" for="email">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-xs transition focus:border-slate-900 focus:outline-none"
                placeholder="you@example.com"
                autocomplete="email"
              />
              @if (form.controls.email.invalid && form.controls.email.touched) {
                <p class="text-xs font-semibold text-red-500">Please enter a valid email.</p>
              }
            </div>

            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-800" for="password">Password</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-xs transition focus:border-slate-900 focus:outline-none"
                placeholder="********"
                autocomplete="current-password"
              />
              @if (form.controls.password.invalid && form.controls.password.touched) {
                <p class="text-xs font-semibold text-red-500">Password is required.</p>
              }
            </div>

            @if (error()) {
              <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {{ error() }}
              </div>
            }

            <button
              type="submit"
              class="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent"></span>
                <span class="ml-2">Signing in...</span>
              } @else {
                <span>Sign in</span>
              }
            </button>

            <p class="text-center text-sm text-slate-600">
              New here?
              <a class="font-semibold text-primary-600 transition hover:text-primary-700" routerLink="/register">Create an account</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.loading.set(false);
        const message = err?.error?.message || 'Unable to sign in. Please check your credentials.';
        this.error.set(message);
      }
    });
  }
}
