import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionLogService } from './services/session-log';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');

  // Injecting this starts SessionLogService's constructor, which begins
  // tracking router navigation events immediately on app load — not just
  // when someone happens to visit Settings > Security.
  constructor(private sessionLog: SessionLogService) {}
}