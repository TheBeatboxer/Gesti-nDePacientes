import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertService {
  constructor(private http: HttpClient) {}

  getAlerts(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/alerts`);
  }

  resolveAlert(id: string): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/alerts/${id}/resolve`, {});
  }

  getActiveAlertsPatientCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${environment.apiUrl}/alerts/active-patients-count`);
  }
}
