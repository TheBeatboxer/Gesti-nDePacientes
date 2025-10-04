import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NurseService {
  private apiUrl = `${environment.apiUrl}/nurses`;

  constructor(private http: HttpClient) {}

  getNurses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getNurse(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addNurse(nurse: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, nurse);
  }

  updateNurse(id: string, nurse: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, nurse);
  }

  deleteNurse(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
