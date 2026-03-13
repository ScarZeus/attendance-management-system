import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  
  
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  signup(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-new/`, data);
  }
  saveUser(res: any) {
    localStorage.setItem("credentials",JSON.stringify(res));
  }
  login(data: any): Observable<any> {
    console.log("We are Registering")
    return this.http.post(`${this.baseUrl}/login/`, data);
  }
}
