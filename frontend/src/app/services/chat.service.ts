import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket!: Socket;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${environment.apiUrl}/chat/unread-count`);
  }

  connect(): void {
    const token = this.authService.getToken();
    if (token) {
      this.socket = io('http://localhost:5001', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
      });

      this.socket.on('disconnect', () => {
      });

      this.socket.on('connect_error', (error) => {
      });
    }
  }

  joinChat(otherUserId: string): void {
    if (this.socket) {
      this.socket.emit('joinChat', otherUserId);
    }
  }

  sendMessage(recipientId: string, message: string): void {
    if (this.socket) {
      this.socket.emit('sendMessage', { recipientId, message });
    }
  }

  onNewMessage(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('newMessage', (data) => {
          observer.next(data);
        });
      }
    });
  }

  getChatHistory(user1Id: string, user2Id: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/chat/history/${user1Id}/${user2Id}`);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}