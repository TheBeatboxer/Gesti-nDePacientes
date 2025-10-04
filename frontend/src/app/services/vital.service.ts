import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VitalService {
  constructor(private http: HttpClient) {}

  getVitals(patientId?: string): Observable<any[]> {
    const url = patientId ? `${environment.apiUrl}/vitals?patientId=${patientId}` : `${environment.apiUrl}/vitals`;
    return this.http.get<any[]>(url);
  }

  addVital(vital: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/vitals`, vital);
  }

  addVitalSelf(vital: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/vitals/self`, vital);
  }

  getVitalsForPatient(patientId: string, filters?: any): Observable<any[]> {
    let params = new URLSearchParams();
    params.append('patientId', patientId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    return this.http.get<any[]>(`${environment.apiUrl}/vitals?${params.toString()}`);
  }
}
