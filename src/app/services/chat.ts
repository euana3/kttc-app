import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

export interface ChatMessage {
  id: number;
  trainer_id: number | null;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface SendChatMessagePayload {
  message: string;
  trainer_id?: number;
}

export interface SendChatMessageResponse {
  reply: ChatMessage;
  userMessage: ChatMessage;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  private readonly baseUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  // GET /history — full transcript, oldest first
  getHistory(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/history`);
  }

  // POST / — send a message, returns assistant reply
  sendMessage(payload: SendChatMessagePayload): Observable<SendChatMessageResponse> {
    return this.http.post<SendChatMessageResponse>(`${this.baseUrl}/`, payload);
  }
}