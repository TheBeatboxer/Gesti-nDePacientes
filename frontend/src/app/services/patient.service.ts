import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PatientService {
  constructor(private http: HttpClient) {}

  getPatients(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any>(`${environment.apiUrl}/patients`, { params: httpParams });
  }

  getPatient(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/patients/${id}`);
  }

  createPatient(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/patients`, payload);
  }

  updatePatient(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/patients/${id}`, payload);
  }

  deletePatient(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/patients/${id}`);
  }

  addHistoryNote(id: string, note: string, nurseId: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/patients/${id}/history`, { note, nurseId });
  }

  assignNurse(patientId: string, nurseId: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/patients/${patientId}/assign-nurse`, { nurseId });
  }

  unassignNurse(patientId: string, nurseId: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/patients/${patientId}/unassign-nurse`, { nurseId });
  }

  getTodaysAppointments(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${environment.apiUrl}/patients/appointments/today`);
  }

  getMyPatient(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/patients/me`);
  }

  updateMyPatient(data: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/patients/me`, data);
  }
}
