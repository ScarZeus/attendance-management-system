import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  
  private baseUrl = 'http://127.0.0.1:8000/api/v1/employees';

  constructor(private http: HttpClient) { }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-new/`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login/`, data);
  }
}
