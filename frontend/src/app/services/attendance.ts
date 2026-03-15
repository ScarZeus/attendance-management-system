import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://127.0.0.1:8000/api/v1';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private http: HttpClient) {}

  checkIn(empId: string): Observable<any> {
    return this.http.post(`${BASE}/employees/${empId}/attendance/check-in/`, {});
  }

  checkOut(empId: string): Observable<any> {
    return this.http.post(`${BASE}/employees/${empId}/attendance/check-out/`, {});
  }

  getAttendance(empId: string): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/employees/${empId}/attendance/`);
  }
}
