import { Component, OnInit, OnDestroy, OnChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    console.log('ChatComponent ngOnInit - recipientId:', this.recipientId);
    this.currentUserId = this.authService.getUser()?.id;
    this.initializeChat();
  }

  ngOnChanges(changes: any): void {
    console.log('ChatComponent ngOnChanges - recipientId changed to:', this.recipientId);
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
      console.log('Initializing chat connection for user:', this.currentUserId, 'with recipient:', this.recipientId);
      this.chatService.connect();
      this.chatService.joinChat(this.recipientId);
      this.loadHistory(this.currentUserId);

      this.messageSubscription = this.chatService.onNewMessage().subscribe(data => {
        console.log('New message received:', data);
        // Always add the message since we're now properly handling duplicates via backend
        this.messages.push({
          sender: data.sender,
          message: data.message,
          timestamp: data.timestamp
        });
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
    console.log('ChatComponent ngOnDestroy');
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
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.currentUserId) {
      this.chatService.sendMessage(this.recipientId, this.newMessage);
      this.newMessage = '';
    }
  }
}
