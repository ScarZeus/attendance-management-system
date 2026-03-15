import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../services/attendance';
import { LeaveService } from '../../services/leave.service';
import { WfhService } from '../../services/wfh.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  credentials = { emp_id: '', name: '', email: '', role: '', department: '' };

  message = '';
  messageType: 'success' | 'error' | '' = '';

  ngOnInit() {
    const data = localStorage.getItem('credentials');
    if (data) {
      try { this.credentials = JSON.parse(data); }
      catch (e) { console.error('Failed to parse credentials', e); }
    }
  }

  constructor(
    private router: Router,
    private attendanceSvc: AttendanceService,
    private leaveSvc: LeaveService,
    private wfhSvc: WfhService
  ) {}

  private showMsg(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => { this.message = ''; this.messageType = ''; }, 4000);
  }

  checkIn() {
    this.attendanceSvc.checkIn(this.credentials.emp_id).subscribe({
      next: () => this.showMsg('Checked in successfully!', 'success'),
      error: (err) => this.showMsg(err?.error?.error || 'Check-in failed', 'error'),
    });
  }

  checkOut() {
    this.attendanceSvc.checkOut(this.credentials.emp_id).subscribe({
      next: () => this.showMsg('Checked out successfully!', 'success'),
      error: (err) => this.showMsg(err?.error?.error || 'Check-out failed', 'error'),
    });
  }

  goLeave() { this.router.navigate(['/leave']); }
  goWfh() { this.router.navigate(['/wfh']); }
  goAttendance() { this.router.navigate(['/attendance']); }
  goHr() { this.router.navigate(['/hr-dashboard']); }
}