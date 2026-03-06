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

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef  
  ) {}

  ngOnInit() {
    const storedEmployee = localStorage.getItem('credentials');
    if (storedEmployee) {
      this.employee = JSON.parse(storedEmployee);
      this.getAttendance(this.employee.emp_id);
    } else {
      console.log("Employee not found in localStorage");
    }
  }

  getAttendance(emp_id: string) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const url = `http://127.0.0.1:8000/api/v1/employees/${emp_id}/attendance/report/monthly/?month=${month}&year=${year}`;

    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        console.log("API Response:", res);
        this.attendanceList = [...res];  
        this.cdr.detectChanges();        
      },
      error: (err) => {
        console.error("API Error:", err);
      }
    });
  }
}