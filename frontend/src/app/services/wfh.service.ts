import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://127.0.0.1:8000/api/v1';

@Injectable({ providedIn: 'root' })
export class WfhService {
  constructor(private http: HttpClient) {}

  applyWfh(data: any): Observable<any> {
    return this.http.post(`${BASE}/wfh-requests/`, data);
  }

  getWfhRequests(empId?: string): Observable<any[]> {
    const params = empId ? `?employee=${empId}` : '';
    return this.http.get<any[]>(`${BASE}/wfh-requests/${params}`);
  }

  approveWfh(id: number): Observable<any> {
    return this.http.patch(`${BASE}/wfh-requests/${id}/approve/`, {});
  }

  rejectWfh(id: number): Observable<any> {
    return this.http.patch(`${BASE}/wfh-requests/${id}/reject/`, {});
  }
}
