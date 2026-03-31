import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report.html',
  styleUrls: ['./report.css']
})
export class Report implements OnInit {
  employee: any = null;
  attendanceList: any[] = [];

  now = new Date();
  year  = this.now.getFullYear();
  month = this.now.getMonth() + 1;

  limit  = 5;
  offset = 0;
  total  = 0;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  get currentPage(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  ngOnInit() {
    const storedEmployee = localStorage.getItem('credentials');
    if (storedEmployee) {
      this.employee = JSON.parse(storedEmployee);
      this.getAttendance();
    } else {
      console.log("Employee not found in localStorage");
    }
  }

  getAttendance() {
    const { emp_id } = this.employee;
    const url = `http://127.0.0.1:8000/api/v1/employees/${emp_id}/attendance/report/monthly/`
      + `?month=${this.month}&year=${this.year}&limit=${this.limit}&offset=${this.offset}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.attendanceList = res.results;
        this.total          = res.total;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("API Error:", err)
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.offset = (page - 1) * this.limit;
    this.getAttendance();
  }

  changeLimit(event: Event) {
    this.limit  = parseInt((event.target as HTMLSelectElement).value, 10);
    this.offset = 0;   // reset to first page
    this.getAttendance();
  }
}