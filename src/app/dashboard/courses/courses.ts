import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CoursesService, Course } from '../../services/courses';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [],
  templateUrl: './courses.html',
  styleUrl: './courses.scss'
})
export class Courses implements OnInit {

  protected readonly courses = signal<Course[]>([]);
  protected readonly loading = signal(true);

  constructor(
    private router: Router,
    private coursesService: CoursesService,
  ) {}

  ngOnInit(): void {
    this.coursesService.getAll().subscribe({
      next: (res: any) => {
        this.courses.set(res.courses ?? res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load courses', err);
        this.loading.set(false);
      },
    });
  }

  protected goToNewModule(): void {
    this.router.navigate(['/dashboard/modules/new']);
  }

  protected goToNewCourse(): void {
    this.router.navigate(['/dashboard/courses/new']);
  }
}