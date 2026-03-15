import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WfhService } from '../../services/wfh.service';

@Component({
  selector: 'app-wfh-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wfh-approval.html',
  styleUrl: './wfh-approval.css',
})
export class WfhApprovalPage implements OnInit {
  requests: any[] = [];
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private wfhSvc: WfhService, private router: Router) {}

  ngOnInit() { this.load(); }

  load() {
    this.wfhSvc.getWfhRequests().subscribe({
      next: (res) => (this.requests = res),
      error: () => {},
    });
  }

  approve(id: number) {
    this.wfhSvc.approveWfh(id).subscribe({
      next: () => { this.showMsg('WFH approved!', 'success'); this.load(); },
      error: (err) => this.showMsg(err?.error?.error || 'Failed to approve.', 'error'),
    });
  }

  reject(id: number) {
    this.wfhSvc.rejectWfh(id).subscribe({
      next: () => { this.showMsg('WFH rejected.', 'success'); this.load(); },
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
