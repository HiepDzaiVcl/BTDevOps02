import { FC } from 'react';
import AuthLayout from '@/layouts/AuthLayout';
import UserLayout from '@/layouts/UserLayout';
import UserManagement from '@/pages/admin/UserManagement';
import MenuManagement from '@/pages/admin/MenuManagement';
import ProductManagement from '@/pages/admin/ProductManagement';
import TableManagement from '@/pages/admin/TableManagement';
import ReservationManagement from '@/pages/admin/ReservationManagement';
import OrderManagement from '@/pages/admin/OrderManagement';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ProfilePage from '@/pages/user/ProfilePage';
import MenuPage from '@/pages/MenuPage';
import ReservationPage from '@/pages/ReservationPage';
import OrderPage from '@/pages/OrderPage';

// Định nghĩa type generic cho component và layout
interface Route {
  path: string;
  component: FC; 
  layout?: FC<{ children: React.ReactNode }>; // Layout cần props children
}

export const publicRoutes: Route[] = [
  { path: '/', component: MenuPage, layout: UserLayout },
  { path: '/login', component: LoginPage, layout: AuthLayout },
  { path: '/register', component: RegisterPage, layout: AuthLayout },
  { path: '/menu', component: MenuPage, layout: UserLayout },
];

export const privateRoutes: Route[] = [
  { path: '/profile', component: ProfilePage, layout: UserLayout },
  { path: '/reservation', component: ReservationPage, layout: UserLayout },
  { path: '/order', component: OrderPage, layout: UserLayout },
];

export const adminRoutes: Route[] = [
  { path: '/admin', component: UserManagement },
  { path: '/admin/users', component: UserManagement },
  { path: '/admin/menus', component: MenuManagement },
  { path: '/admin/products', component: ProductManagement},
  { path: '/admin/tables', component: TableManagement },
  { path: '/admin/reservations', component: ReservationManagement},
  { path: '/admin/orders', component: OrderManagement },
];