import { Routes, type CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CatalogComponent } from './features/catalog/catalog.component';
import { ProductDetailComponent } from './features/catalog/product-detail.component';
import { VendorDashboardComponent } from './features/vendor/vendor-dashboard.component';
import { ProductFormComponent } from './features/vendor/product-form.component';
import { ProductListComponent } from './features/vendor/product-list.component';
import { VendorOrdersComponent } from './features/vendor/vendor-orders.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { MyOrdersComponent } from './features/orders/my-orders.component';
import { AuthStore } from './core/store/auth.store';
import { CategoryManagementComponent } from './features/admin/category-management.component';
import { UserManagementComponent } from './features/admin/user-management.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { ProfileSettingsComponent } from './features/customer/profile-settings.component';
import { WishlistComponent } from './features/customer/wishlist.component';

const authGuard: CanActivateFn = () => {
	const auth = inject(AuthStore);
	const router = inject(Router);
	const isAuthed = auth.isAuthenticated();
	return isAuthed ? true : router.createUrlTree(['/']);
};

const roleGuard = (roles: string[]): CanActivateFn => () => {
	const auth = inject(AuthStore);
	const router = inject(Router);
	if (!auth.isAuthenticated()) {
		return router.createUrlTree(['/']);
	}

	const role = auth.user()?.role?.toUpperCase().replace('ROLE_', '') ?? '';
	return roles.includes(role) ? true : router.createUrlTree(['/']);
};

const adminGuard = roleGuard(['ADMIN']);
const vendorGuard = roleGuard(['VENDOR']);
const customerGuard = roleGuard(['CUSTOMER']);
const vendorOrAdminGuard = roleGuard(['VENDOR', 'ADMIN']);

export const routes: Routes = [
	{ path: '', component: CatalogComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'catalog', component: CatalogComponent },
	{ path: 'products/:id', component: ProductDetailComponent },
	{
		path: '',
		component: MainLayoutComponent,
		canActivate: [authGuard],
		children: [
			{ path: 'my-orders', component: MyOrdersComponent },
			{ path: 'profile', component: ProfileSettingsComponent },
			{ path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
			{ path: 'admin/users', component: UserManagementComponent, canActivate: [adminGuard] },
			{ path: 'vendor/dashboard', component: VendorDashboardComponent, canActivate: [vendorGuard] },
			{ path: 'dashboard', component: VendorDashboardComponent, canActivate: [vendorGuard] },
			{ path: 'vendor/orders', component: VendorOrdersComponent, canActivate: [vendorGuard] },
			{ path: 'dashboard/orders', component: VendorOrdersComponent, canActivate: [vendorGuard] },
			{ path: 'dashboard/categories', component: CategoryManagementComponent, canActivate: [vendorOrAdminGuard] },
			{ path: 'admin/categories', component: CategoryManagementComponent, canActivate: [adminGuard] },
			{ path: 'dashboard/products', component: ProductListComponent, canActivate: [vendorGuard] },
			{ path: 'dashboard/products/new', component: ProductFormComponent, canActivate: [vendorGuard] },
			{ path: 'dashboard/products/:id/edit', component: ProductFormComponent, canActivate: [vendorGuard] },
			{ path: 'customer/orders', component: MyOrdersComponent, canActivate: [customerGuard] },
			{ path: 'customer/wishlist', component: WishlistComponent, canActivate: [customerGuard] },
			{ path: 'customer/profile', component: ProfileSettingsComponent, canActivate: [customerGuard] }
		]
	},
	{ path: '**', redirectTo: '' }
];
