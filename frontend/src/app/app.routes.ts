import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Report } from './pages/report/report';

export const routes: Routes = [
    {path : "login", component: Login },
    {path: "attendance",component: Report},
    {path: "dashboard" , component: Dashboard},
    {path: "**", redirectTo: 'login'},
];