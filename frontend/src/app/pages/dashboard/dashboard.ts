import { Component, OnInit, HostListener } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { submit } from '@angular/forms/signals';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  constructor(private auth: Auth, private router: Router) {}

  credentials = {
    emp_id: '',
    name: '',
    email: '',
    department: ''
  };

  showModal = false;
  showReason = false;
  showCheckin = true;
  dropdownOpen = false;
  todayDate = '';

  attendance = {
    status: 'PRESENT',
    check_in: '',
    check_out: '',
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
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.attendance-dropdown')) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation(); 
    this.dropdownOpen = !this.dropdownOpen;
  }

  openForm(event: Event, status: string) {
    event.stopPropagation(); 
    this.dropdownOpen = false;
    this.attendance.status = status;
    this.onStatusChange();
    this.showModal = true;
    const now = new Date();
    this.todayDate = now.toISOString().split('T')[0];
  }

  onStatusChange() {
    const status = this.attendance.status;
    if (status === 'ABSENT') {
      this.showReason = true;
      this.showCheckin = false;
    } else if (status === 'HALF_DAY') {
      this.showReason = true;
      this.showCheckin = true;
    } else if (status === 'WFH') {
      this.showReason = false;
      this.showCheckin = true;
    } else {
      this.showReason = false;
      this.showCheckin = true;
    }
  }

  view_attendance() {
  this.router.navigate(['/attendance']);
}

  submitAttendance() {
    if (this.showCheckin && (!this.attendance.check_in || !this.attendance.check_out)) {
      alert('Please enter both Check In and Check Out times.');
      return;
    }
    if (this.showReason && !this.attendance.reason.trim()) {
      alert('Please provide a reason.');
      return;
    }

    const payload = {
      emp_id: this.credentials.emp_id,
      date: this.todayDate,
      status: this.attendance.status,
      check_in: this.attendance.check_in || null,
      check_out: this.attendance.check_out || null,
      reason: this.attendance.reason || 'N/A'
    };
    this.auth.saveAttendace(payload).subscribe({
  next: (res) => {
    console.log("Attendance saved", res);
  },
  error: (err) => {
    console.error("Error saving attendance", err);
  }
});
    console.log('Submitting:', payload);

    this.resetAndClose();
  }

  closeModal() {
    this.resetAndClose();
  }

  private resetAndClose() {
    this.showModal = false;
    this.showReason = false;
    this.showCheckin = true;
    this.attendance = {
      status: 'PRESENT',
      check_in: '',
      check_out: '',
      reason: ''
    };
  }
}