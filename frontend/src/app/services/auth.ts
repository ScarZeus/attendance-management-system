import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  saveAttendace(payload: { emp_id: string; date: string; status: string; check_in: string | null; check_out: string | null; reason: string; }) {
    console.log("Sending to Server")
    const res =  this.http.post(`${this.baseUrl}/${payload.emp_id }/attendance/mark-today/`,payload);
    console.log(res);
    return res;
  }
  saveUser(res: any) {
    localStorage.setItem("credentials",JSON.stringify(res));
  }
  
  private baseUrl = 'http://127.0.0.1:8000/api/v1/employees';

  constructor(private http: HttpClient) { }

  signup(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-new/`, data);
  }

  login(data: any): Observable<any> {
    console.log("We are Registering")
    return this.http.post(`${this.baseUrl}/login/`, data);
  }
}
