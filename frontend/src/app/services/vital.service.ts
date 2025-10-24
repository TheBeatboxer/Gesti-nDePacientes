import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VitalService {
  constructor(private http: HttpClient) {}

  private getPatientIdFromUrl(): string {
    // This method should be called from the component where patientId is available
    // For now, return empty string - the component should pass patientId
    return '';
  }

  getVitals(patientId?: string): Observable<any[]> {
    const url = patientId ? `${environment.apiUrl}/vitals?patientId=${patientId}` : `${environment.apiUrl}/vitals`;
    return this.http.get<any[]>(url);
  }

  addVital(vital: any): Observable<any> {
    const patientId = vital.patientId || this.getPatientIdFromUrl();
    return this.http.post<any>(`${environment.apiUrl}/vitals/${patientId}`, vital);
  }

  addVitalSelf(vital: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/vitals/self`, vital);
  }

  getVitalsForPatient(patientId: string, filters?: any): Observable<any[]> {
    let params = new URLSearchParams();
    params.append('patientId', patientId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
    return this.http.get<any[]>(`${environment.apiUrl}/vitals?${params.toString()}`);
  }
}
