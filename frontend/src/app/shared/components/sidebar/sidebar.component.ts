import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavLink {
  label: string;
  path: string;
  iconPath: string;
  exact?: boolean;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  protected readonly authService = inject(AuthService);

  private readonly normalizedRole = computed(() => {
    const rawRole = this.authService.getUserRole()?.toUpperCase() ?? '';
    return rawRole.replace('ROLE_', '');
  });

  protected readonly isAdmin = computed(() => this.normalizedRole() === 'ADMIN');
  protected readonly isVendor = computed(() => this.normalizedRole() === 'VENDOR');
  protected readonly isCustomer = computed(() => this.normalizedRole() === 'CUSTOMER');

  protected readonly currentUser = computed(() => this.authService.getCurrentUser());

  protected readonly currentRole = this.normalizedRole;

  protected readonly adminSections: NavSection[] = [
    {
      title: 'Management',
      links: [
        {
          label: 'Platform Stats',
          path: '/admin/dashboard',
          iconPath: 'M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4Zm9 0A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v1A1.5 1.5 0 0 1 18.5 8h-4A1.5 1.5 0 0 1 13 6.5v-1Zm0 6A1.5 1.5 0 0 1 14.5 10h4a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-5ZM4 14.5A1.5 1.5 0 0 1 5.5 13h4a1.5 1.5 0 0 1 1.5 1.5v2A1.5 1.5 0 0 1 9.5 18h-4A1.5 1.5 0 0 1 4 16.5v-2Z',
          exact: true
        },
        {
          label: 'Users',
          path: '/admin/users',
          iconPath: 'M7 7a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm9 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 18a5 5 0 0 1 10 0v1H4v-1Zm11 1v-1a6.97 6.97 0 0 0-1.25-4h.25a4 4 0 0 1 4 4v1h-3Z'
        },
        {
          label: 'Global Categories',
          path: '/admin/categories',
          iconPath: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h2.379a2 2 0 0 1 1.414.586l.621.621a2 2 0 0 0 1.414.586H17.5A2.5 2.5 0 0 1 20 8.293V16.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-10Z'
        }
      ]
    }
  ];

  protected readonly vendorSections: NavSection[] = [
    {
      title: 'Personal',
      links: [
        {
          label: 'Dashboard',
          path: '/vendor/dashboard',
          iconPath: 'M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4Zm9 0A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v1A1.5 1.5 0 0 1 18.5 8h-4A1.5 1.5 0 0 1 13 6.5v-1Zm0 6A1.5 1.5 0 0 1 14.5 10h4a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-5ZM4 14.5A1.5 1.5 0 0 1 5.5 13h4a1.5 1.5 0 0 1 1.5 1.5v2A1.5 1.5 0 0 1 9.5 18h-4A1.5 1.5 0 0 1 4 16.5v-2Z',
          exact: true
        }
      ]
    },
    {
      title: 'Management',
      links: [
        {
          label: 'My Products',
          path: '/dashboard/products',
          iconPath: 'M4.75 6.5A2.75 2.75 0 0 1 7.5 3.75h9A2.75 2.75 0 0 1 19.25 6.5v9A2.75 2.75 0 0 1 16.5 18.25h-9A2.75 2.75 0 0 1 4.75 15.5v-9Zm3 1.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Zm0 3.5a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5h-5Z'
        },
        {
          label: 'Sales/Orders',
          path: '/vendor/orders',
          iconPath: 'M5.5 4A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 18.5 7H14l-2-3H5.5Zm2.25 8a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z'
        }
      ]
    }
  ];

  protected readonly customerSections: NavSection[] = [
    {
      title: 'Shopping',
      links: [
        {
          label: 'All Categories',
          path: '/catalog',
          iconPath: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h2.379a2 2 0 0 1 1.414.586l.621.621a2 2 0 0 0 1.414.586H17.5A2.5 2.5 0 0 1 20 8.293V16.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-10Z',
          exact: true
        },
        {
          label: 'Wishlist',
          path: '/customer/wishlist',
          iconPath: 'M12.001 20s-7-4.35-9.2-8.1c-1.56-2.66-.67-6.04 1.81-7.35 2.02-1.06 4.31-.25 5.39 1.36 1.08-1.61 3.37-2.42 5.39-1.36 2.48 1.31 3.37 4.69 1.81 7.35-2.2 3.75-9.2 8.1-9.2 8.1Z'
        }
      ]
    },
    {
      title: 'Personal',
      links: [
        {
          label: 'My Orders',
          path: '/customer/orders',
          iconPath: 'M5.5 4A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 18.5 7H14l-2-3H5.5Zm2.25 8a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z'
        }
      ]
    }
  ];

  getRoleBadgeStyle(role: string): string {
    const normalized = role.toUpperCase().replace('ROLE_', '');
    if (normalized === 'ADMIN') {
      return 'bg-violet-500/10 text-violet-400';
    }
    if (normalized === 'VENDOR') {
      return 'bg-amber-500/10 text-amber-400';
    }
    return 'bg-blue-500/10 text-blue-400';
  }

  logout(): void {
    this.authService.logout();
  }
}
