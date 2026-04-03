import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/store/auth.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly isAuthed = this.authStore.isAuthenticated;
  protected readonly welcomeName = computed(() => {
    const user = this.authStore.user();
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return fullName || user?.email || 'Vendor';
  });
}
