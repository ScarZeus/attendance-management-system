import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://127.0.0.1:8000/api/v1';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  constructor(private http: HttpClient) {}

  applyLeave(data: any): Observable<any> {
    return this.http.post(`${BASE}/leave-requests/`, data);
  }

  getLeaves(empId?: string): Observable<any[]> {
    const params = empId ? `?employee=${empId}` : '';
    return this.http.get<any[]>(`${BASE}/leave-requests/${params}`);
  }

  approveLeave(id: number): Observable<any> {
    return this.http.patch(`${BASE}/leave-requests/${id}/approve/`, {});
  }

  rejectLeave(id: number): Observable<any> {
    return this.http.patch(`${BASE}/leave-requests/${id}/reject/`, {});
  }
}
