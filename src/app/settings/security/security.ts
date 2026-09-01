import { Component } from '@angular/core';
import { ChangePassword } from '../change-password/change-password';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [ChangePassword],
  templateUrl: './security.html',
  styleUrl: './security.scss'
})
export class Security {}