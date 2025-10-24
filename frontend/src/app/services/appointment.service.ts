import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private http: HttpClient) { }

  getAppointments(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any>(`${environment.apiUrl}/appointments`, { params: httpParams });
  }

  getAppointment(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/appointments/${id}`);
  }

  createAppointment(appointment: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/appointments`, appointment);
  }

  updateAppointment(id: string, appointment: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/appointments/${id}`, appointment);
  }

  deleteAppointment(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/appointments/${id}`);
  }

  confirmAppointment(id: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/appointments/${id}/confirm`, {});
  }

  getUpcomingReminders(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/appointments/reminders/upcoming`);
  }

  getMyAppointments(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/appointments/my`);
  }
}
