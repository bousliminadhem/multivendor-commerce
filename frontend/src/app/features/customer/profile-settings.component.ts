import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileSettingsComponent {
  private readonly authService = inject(AuthService);

  protected readonly user = computed(() => this.authService.getCurrentUser());

  protected readonly fullName = computed(() => {
    const user = this.user();
    if (!user) {
      return 'Guest User';
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    if (name) {
      return name;
    }

    return user.email?.split('@')[0] || 'Aurora User';
  });
}
