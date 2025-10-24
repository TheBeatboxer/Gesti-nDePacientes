import { Component, OnInit, OnDestroy, OnChanges, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, OnChanges {
  @Input() recipientId!: string;
  messages: any[] = [];
  newMessage: string = '';
  currentUserId?: string;
  private messageSubscription!: Subscription;
  private isConnected = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.getUser()?.id;
    this.initializeChat();
  }

  ngOnChanges(changes: any): void {
    if (changes.recipientId && this.recipientId && this.currentUserId && !this.isConnected) {
      this.initializeChat();
    } else if (changes.recipientId && this.recipientId && this.isConnected) {
      // Re-join if recipient changes
      this.chatService.joinChat(this.recipientId);
      this.loadHistory(this.currentUserId!);
    }
  }

  private initializeChat(): void {
    if (this.currentUserId && this.recipientId && !this.isConnected) {
      this.chatService.connect();
      this.chatService.joinChat(this.recipientId);
      this.loadHistory(this.currentUserId);

      this.messageSubscription = this.chatService.onNewMessage().subscribe(data => {
        this.messages.push({
          sender: data.sender,
          message: data.message,
          timestamp: data.timestamp
        });
        this.cdr.detectChanges();
        // Scroll to bottom after receiving new message
        setTimeout(() => {
          const messagesArea = document.querySelector('.messages-area');
          if (messagesArea) {
            messagesArea.scrollTop = messagesArea.scrollHeight;
          }
        }, 0);
      });

      this.isConnected = true;
    }
  }

  ngOnDestroy(): void {
    if (this.isConnected) {
      this.chatService.disconnect();
      this.isConnected = false;
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  loadHistory(currentUserId: string): void {
    this.chatService.getChatHistory(currentUserId, this.recipientId).subscribe(history => {
      this.messages = history.map((msg: any) => ({
        sender: msg.from,
        message: msg.text,
        timestamp: msg.createdAt
      }));
      this.cdr.detectChanges();
      // Scroll to bottom after loading history
      setTimeout(() => {
        const messagesArea = document.querySelector('.messages-area');
        if (messagesArea) {
          messagesArea.scrollTop = messagesArea.scrollHeight;
        }
      }, 0);
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.currentUserId) {
      this.chatService.sendMessage(this.recipientId, this.newMessage);
      this.newMessage = '';
    }
  }
}
