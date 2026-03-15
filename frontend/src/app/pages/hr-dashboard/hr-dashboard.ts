import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './hr-dashboard.html',
  styleUrl: './hr-dashboard.css',
})
export class HrDashboard {
  constructor(private router: Router) {}

  goLeaveApproval() { this.router.navigate(['/leave-approval']); }
  goWfhApproval() { this.router.navigate(['/wfh-approval']); }
  goBack() { this.router.navigate(['/dashboard']); }
}
