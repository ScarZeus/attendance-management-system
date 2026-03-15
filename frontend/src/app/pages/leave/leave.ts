import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaveService } from '../../services/leave.service';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave.html',
  styleUrl: './leave.css',
})
export class LeavePage implements OnInit {
  credentials = { emp_id: '', name: '' };

  form = { leave_type: '', from_date: '', to_date: '', reason: '' };

  history: any[] = [];
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private leaveSvc: LeaveService, private router: Router) {}

  ngOnInit() {
    const data = localStorage.getItem('credentials');
    if (data) {
      try { this.credentials = JSON.parse(data); } catch (_) {}
    }
    this.loadHistory();
  }

  loadHistory() {
    this.leaveSvc.getLeaves(this.credentials.emp_id).subscribe({
      next: (res) => (this.history = res),
      error: () => {},
    });
  }

  submit() {
    if (!this.form.leave_type || !this.form.from_date || !this.form.to_date || !this.form.reason) {
      this.showMsg('All fields are required.', 'error');
      return;
    }

    const payload = {
      employee: this.credentials.emp_id,
      leave_type: this.form.leave_type,
      from_date: this.form.from_date,
      to_date: this.form.to_date,
      reason: this.form.reason,
    };

    this.leaveSvc.applyLeave(payload).subscribe({
      next: () => {
        this.showMsg('Leave request submitted!', 'success');
        this.form = { leave_type: '', from_date: '', to_date: '', reason: '' };
        this.loadHistory();
      },
      error: (err) => this.showMsg(err?.error?.detail || 'Failed to submit leave.', 'error'),
    });
  }

  private showMsg(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => { this.message = ''; this.messageType = ''; }, 4000);
  }

  goBack() { this.router.navigate(['/dashboard']); }
}
