import { Component, OnInit, HostListener } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Attendance } from '../../services/attendance';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  now = new Date();

  constructor(
    private auth: Auth,
    private router: Router,
    private attendanceEmp: Attendance
  ) {}

  credentials = {
    emp_id: '',
    name: '',
    email: '',
    role: '',
    department: ''
  };

  modalTitle    = '';
  showModal     = false;
  showCheckin   = false;
  showCheckout  = false;
  showDateRange = false;
  showReason    = false;

  todayDate = '';

  attendance: any = {
    status: '',
    check_in: '',
    check_out: '',
    from_date: '',
    to_date: '',
    reason: ''
  };

  ngOnInit() {
    const data = localStorage.getItem('credentials');
    if (data) {
      try {
        this.credentials = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse credentials', e);
      }
    }
    this.todayDate = new Date().toISOString().split('T')[0];
  }

  openForm(event: Event, type: string) {
    event.stopPropagation();

    this.attendance = {
      status: type,
      check_in: '',
      check_out: '',
      from_date: '',
      to_date: '',
      reason: ''
    };

    this.showCheckin   = false;
    this.showCheckout  = false;
    this.showDateRange = false;
    this.showReason    = false;

    switch (type) {
      case 'CHECKIN':
        this.modalTitle = 'Check In';

        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        this.attendance.check_in = `${hours}:${minutes}`;

        this.showCheckin = true;
        break;

      case 'CHECKOUT':
        this.modalTitle   = 'Check Out';
        this.showCheckout = true;
        break;

      case 'HALF_DAY':
        this.modalTitle   = 'Half Day';
        this.showCheckin  = true;
        this.showCheckout = true;
        this.showReason   = true;
        break;

      case 'LEAVE':
        this.modalTitle    = 'Apply Leave';
        this.showDateRange = true;
        this.showReason    = true;
        break;

      case 'WFH':
        this.modalTitle    = 'Work From Home';
        this.showDateRange = true;
        this.showReason    = true;
        break;
    }

    this.showModal = true;
  }

  submitAttendance() {
    if (this.showCheckin && !this.attendance.check_in) {
      alert('Please enter Check In time.');
      return;
    }
    if (this.showCheckout && !this.attendance.check_out) {
      alert('Please enter Check Out time.');
      return;
    }
    if (this.showDateRange && (!this.attendance.from_date || !this.attendance.to_date)) {
      alert('Please select From and To dates.');
      return;
    }
    if (this.showReason && !this.attendance.reason.trim()) {
      alert('Please provide a reason.');
      return;
    }

    const payload = {
      emp_id:    this.credentials.emp_id,
      date:      this.todayDate,
      status:    this.attendance.status,
      check_in:  this.attendance.check_in  || null,
      check_out: this.attendance.check_out || null,
      from_date: this.attendance.from_date || null,
      to_date:   this.attendance.to_date   || null,
      reason:    this.attendance.reason    || null
    };

    console.log('Payload:', payload);

    this.attendanceEmp.saveAttendace(payload, this.attendance.from_date, this.attendance.to_date)
      .subscribe({
        next: (res) => {
          console.log('Attendance saved', res);
          alert('Attendance submitted successfully!');
        },
        error: (err) => {
          console.error('Error saving attendance', err);
          alert('Failed to submit attendance.');
        }
      });

    this.resetAndClose();
  }

  closeModal() {
    this.resetAndClose();
  }

  view_attendance() {
    this.router.navigate(['/attendance']);
  }

  private resetAndClose() {
    this.showModal     = false;
    this.showCheckin   = false;
    this.showCheckout  = false;
    this.showDateRange = false;
    this.showReason    = false;
    this.modalTitle    = '';
    this.attendance = {
      status: '',
      check_in: '',
      check_out: '',
      from_date: '',
      to_date: '',
      reason: ''
    };
  }
}