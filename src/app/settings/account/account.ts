import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class Account implements OnInit {
  protected readonly fullname = signal('');
  protected readonly username = signal('');

  ngOnInit(): void {
    this.fullname.set(sessionStorage.getItem('fullname') || '');
    this.username.set(sessionStorage.getItem('username') || '');
  }
}