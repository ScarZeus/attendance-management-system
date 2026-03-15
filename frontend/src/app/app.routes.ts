import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Report } from './pages/report/report';
import { LeavePage } from './pages/leave/leave';
import { WfhPage } from './pages/wfh/wfh';
import { HrDashboard } from './pages/hr-dashboard/hr-dashboard';
import { LeaveApprovalPage } from './pages/leave-approval/leave-approval';
import { WfhApprovalPage } from './pages/wfh-approval/wfh-approval';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'attendance', component: Report },
  { path: 'leave', component: LeavePage },
  { path: 'wfh', component: WfhPage },
  { path: 'hr-dashboard', component: HrDashboard },
  { path: 'leave-approval', component: LeaveApprovalPage },
  { path: 'wfh-approval', component: WfhApprovalPage },
  { path: '**', redirectTo: 'login' },
];