import { Component, OnInit } from '@angular/core';
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
  

  modalTitle = '';
  showModal = false;
  showCheckin = false;
  showCheckout = false;
  showDateRange = false;
  showReason = false;
  showLeaveType = false;

  todayDate = '';

  leaveTypes = [
    { value: 'SICK', label: 'Sick Leave' },
    { value: 'CASUAL', label: 'Casual Leave' }
  ];

  attendance: any = {
    status: '',
    check_in: '',
    check_out: '',
    from_date: '',
    to_date: '',
    reason: '',
    leave_type: ''
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

  getCurrentTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  openForm(event: Event, type: string) {
    event.stopPropagation();

    this.attendance = {
      status: type,
      employee: this.credentials.emp_id,
      check_in: '',
      check_out: '',
      reason: '',
    };

    this.showCheckin = false;
    this.showCheckout = false;
    this.showDateRange = false;
    this.showReason = false;
    this.showLeaveType = false;

    switch (type) {

      case 'CHECKIN':
        this.modalTitle = 'Check In';
        this.attendance.check_in = this.getCurrentTime();
        this.showCheckin = true;
        
        break;

      case 'CHECKOUT':
        this.modalTitle = 'Check Out';
        this.attendance.check_out = this.getCurrentTime();
        this.showCheckout = true;
        break;

      case 'LEAVE':
        this.modalTitle = 'Apply Leave';
        this.showDateRange = true;
        this.showReason = true;
        this.showLeaveType = true;
        break;

      case 'WFH':
        this.modalTitle = 'Work From Home';
        this.showDateRange = true;
        this.showReason = true;
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

    if (this.showLeaveType && !this.attendance.leave_type) {
      alert('Please select Leave Type.');
      return;
    }

    if(this.modalTitle === "Check in"){
      // write the check in login here
      const check_in_payload = {

      }
    }
    if(this.modalTitle === "Check out"){
      //write the check out logic here
    }

    if(this.modalTitle === "Apply Leave"){
      //write logic for Applying leave
    }
    if(this.modalTitle === "Work From Home"){
      //write logic for Apply from home
    }

    
  }

  closeModal() {
    this.resetAndClose();
  }

  view_attendance() {
    this.router.navigate(['/attendance']);
  }

  private resetAndClose() {
    this.showModal = false;
    this.showCheckin = false;
    this.showCheckout = false;
    this.showDateRange = false;
    this.showReason = false;
    this.showLeaveType = false;

    this.modalTitle = '';

    this.attendance = {
      status: '',
      check_in: '',
      check_out: '',
      from_date: '',
      to_date: '',
      reason: '',
      leave_type: ''
    };
  }
}