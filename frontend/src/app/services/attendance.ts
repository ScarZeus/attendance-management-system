import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Attendance {
  private baseUrl = fetch(environment.apiUrl);
  constructor(private http: HttpClient) { }
  saveAttendace(payload: { emp_id: string; date: string; status: string; check_in: string | null; check_out: string | null; reason: string; },from_date : string, to_date:string) {
    console.log("Sending to Server")
    if(payload.status === "WFH"){
      console.log("This is a WFH")
      console.log("check_in:"+ payload.check_in);
      const res = this.http.post(`${this.baseUrl}/${payload.emp_id}/attendance/mark-attendance/?from=${from_date}&to=${to_date}`,payload);
      return res;
    }
    else if(payload.status === "ABSENT"){
      const res = this.http.post(`${this.baseUrl}/${payload.emp_id}/attendance/mark-attendance/?from=${from_date}&to=${to_date}`,payload);
      return res;
    }
    const res =  this.http.post(`${this.baseUrl}/${payload.emp_id }/attendance/mark-today/`,payload);
    console.log(res);
    return res;
  }
  
}
