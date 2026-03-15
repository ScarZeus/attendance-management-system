import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WfhService } from '../../services/wfh.service';

@Component({
  selector: 'app-wfh',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wfh.html',
  styleUrl: './wfh.css',
})
export class WfhPage implements OnInit {
  credentials = { emp_id: '', name: '' };

  form = { from_date: '', to_date: '', reason: '' };

  history: any[] = [];
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private wfhSvc: WfhService, private router: Router) {}

  ngOnInit() {
    const data = localStorage.getItem('credentials');
    if (data) {
      try { this.credentials = JSON.parse(data); } catch (_) {}
    }
    this.loadHistory();
  }

  loadHistory() {
    this.wfhSvc.getWfhRequests(this.credentials.emp_id).subscribe({
      next: (res) => (this.history = res),
      error: () => {},
    });
  }

  submit() {
    if (!this.form.from_date || !this.form.to_date || !this.form.reason) {
      this.showMsg('All fields are required.', 'error');
      return;
    }

    const payload = {
      employee: this.credentials.emp_id,
      from_date: this.form.from_date,
      to_date: this.form.to_date,
      reason: this.form.reason,
    };

    this.wfhSvc.applyWfh(payload).subscribe({
      next: () => {
        this.showMsg('WFH request submitted!', 'success');
        this.form = { from_date: '', to_date: '', reason: '' };
        this.loadHistory();
      },
      error: (err) => this.showMsg(err?.error?.detail || 'Failed to submit WFH request.', 'error'),
    });
  }

  private showMsg(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => { this.message = ''; this.messageType = ''; }, 4000);
  }

  goBack() { this.router.navigate(['/dashboard']); }
}
