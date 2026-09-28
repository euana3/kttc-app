import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

type CertStatus = 'valid' | 'soon' | 'expired' | 'permanent';

interface Certification {
  name: string;
  issuer: string;
  certNo: string;
  issued: string;           // ISO date
  expiry: string | null;    // null = does not expire
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class Account implements OnInit {
  protected readonly fullname = signal('');
  protected readonly username = signal('');

  // Hardcoded showcase data (replace with an API call later)
  private readonly certifications: Certification[] = [
    { name: 'Class 4 Driving Licence (Heavy Rigid)', issuer: 'Land Transport Authority (LTA)',
      certNo: 'LTA-C4-2019-04821', issued: '2019-04-12', expiry: '2029-05-10' },
    { name: 'Heavy Vehicle Inspection - Level 2', issuer: 'Singapore Vehicle Inspection Academy',
      certNo: 'HVI-L2-2024-0193', issued: '2024-01-21', expiry: '2027-01-20' },
    { name: 'Standard First Aid + CPR/AED', issuer: 'SCDF-Accredited Training Provider',
      certNo: 'FA-2024-33018', issued: '2024-06-30', expiry: '2026-06-30' },
    { name: 'WSQ Perform Work at Heights', issuer: 'MOM-Approved Training Provider',
      certNo: 'WAH-2023-08816', issued: '2023-08-19', expiry: null },
  ];

  protected readonly certs = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.certifications
      .map((c) => {
        if (!c.expiry) {
          return { ...c, daysLeft: null as number | null, status: 'permanent' as CertStatus };
        }
        const daysLeft = Math.ceil((new Date(c.expiry).getTime() - today.getTime()) / 86_400_000);
        const status: CertStatus = daysLeft < 0 ? 'expired' : daysLeft <= 90 ? 'soon' : 'valid';
        return { ...c, daysLeft: daysLeft as number | null, status };
      })
      // most urgent first; certificates with no expiry sink to the bottom
      .sort((a, b) => (a.daysLeft ?? Number.MAX_SAFE_INTEGER) - (b.daysLeft ?? Number.MAX_SAFE_INTEGER));
  });

  protected statusLabel(status: CertStatus, daysLeft: number | null): string {
    if (status === 'permanent') return 'No expiry';
    if (daysLeft === null) return '';
    if (status === 'expired') return `Expired ${Math.abs(daysLeft)}d ago`;
    if (status === 'soon') return `Expires in ${daysLeft}d`;
    return 'Valid';
  }

  ngOnInit(): void {
    this.fullname.set(sessionStorage.getItem('fullname') || '');
    this.username.set(sessionStorage.getItem('username') || '');
  }
}