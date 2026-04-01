import { Routes, type CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CatalogComponent } from './features/catalog/catalog.component';
import { VendorDashboardComponent } from './features/vendor/vendor-dashboard.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login.component';
import { MyOrdersComponent } from './features/orders/my-orders.component';
import { AuthStore } from './core/store/auth.store';

// Functional guard: allow only authenticated vendors; otherwise redirect home.
const vendorGuard: CanActivateFn = () => {
	const auth = inject(AuthStore);
	const router = inject(Router);
	const isAuthed = auth.isAuthenticated();
	const role = auth.user()?.role;
	return isAuthed && role?.toLowerCase() === 'vendor'
		? true
		: router.createUrlTree(['/']);
};

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'catalog', component: CatalogComponent },
	{ path: 'my-orders', component: MyOrdersComponent },
	{ path: 'dashboard', component: VendorDashboardComponent, canActivate: [vendorGuard] },
	{ path: '**', redirectTo: '' }
];
