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

export interface SendMessagePayload {
  message: string;
  trainer_id?: number;
}

// ASSUMPTION: the guide only says POST / "returns the assistant's reply and persists
// both sides" — not the exact JSON shape. Assuming it returns the new assistant
// ChatMessage row (same shape as a GET /history item). Verify via Postman if
// responses come back unexpectedly empty/undefined.
export interface SendMessageResponse extends ChatMessage {}

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

  // POST / — send a message, get the assistant's reply back
  sendMessage(payload: SendMessagePayload): Observable<SendMessageResponse> {
    return this.http.post<SendMessageResponse>(`${this.baseUrl}/`, payload);
  }
}