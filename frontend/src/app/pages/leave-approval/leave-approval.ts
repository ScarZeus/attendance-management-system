import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LeaveService } from '../../services/leave.service';

@Component({
  selector: 'app-leave-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-approval.html',
  styleUrl: './leave-approval.css',
})
export class LeaveApprovalPage implements OnInit {
  requests: any[] = [];
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private leaveSvc: LeaveService, private router: Router) {}

  ngOnInit() { this.load(); }

  load() {
    this.leaveSvc.getLeaves().subscribe({
      next: (res) => (this.requests = res),
      error: () => {},
    });
  }

  approve(id: number) {
    this.leaveSvc.approveLeave(id).subscribe({
      next: () => { this.showMsg('Leave approved!', 'success'); this.load(); },
      error: (err) => this.showMsg(err?.error?.error || 'Failed to approve.', 'error'),
    });
  }

  reject(id: number) {
    this.leaveSvc.rejectLeave(id).subscribe({
      next: () => { this.showMsg('Leave rejected.', 'success'); this.load(); },
      error: (err) => this.showMsg(err?.error?.error || 'Failed to reject.', 'error'),
    });
  }

  private showMsg(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => { this.message = ''; this.messageType = ''; }, 4000);
  }

  goBack() { this.router.navigate(['/hr-dashboard']); }
}
