import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CoursesService, Course } from '../../services/courses';
import { BatchWithCourseName } from '../../services/batches';

export interface CoursesListResponse {
  courses: Course[];
  batches: BatchWithCourseName[];
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.html',
  styleUrl: './courses.scss'
})
export class Courses implements OnInit {

  protected readonly courses = signal<Course[]>([]);
  protected readonly loading = signal(true);

  // Inline description-edit state — only one course editable at a time.
  protected readonly editingCourseId = signal<number | null>(null);
  protected readonly editingDescription = signal('');
  protected readonly savingDescription = signal(false);
  protected readonly descriptionError = signal<string | null>(null);

  constructor(
    private router: Router,
    private coursesService: CoursesService,
  ) {}

  ngOnInit(): void {
    this.coursesService.getAll().subscribe({
      next: (res) => {
        this.courses.set(res.courses);
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

  protected startEditingDescription(course: Course): void {
    this.editingCourseId.set(course.id);
    this.editingDescription.set(course.description ?? '');
    this.descriptionError.set(null);
  }

  protected cancelEditingDescription(): void {
    this.editingCourseId.set(null);
    this.editingDescription.set('');
    this.descriptionError.set(null);
  }

  protected saveDescription(courseId: number): void {
    const newDescription = this.editingDescription().trim();
    this.savingDescription.set(true);
    this.descriptionError.set(null);

    this.coursesService.update(courseId, { description: newDescription }).subscribe({
      next: () => {
        // Applied optimistically with the value we just sent, rather than trusting
        // the response body shape — PUT /api/courses/:id's exact response hasn't
        // been confirmed via Postman yet.
        this.courses.update(list =>
          list.map(c => c.id === courseId ? { ...c, description: newDescription } : c)
        );
        this.savingDescription.set(false);
        this.editingCourseId.set(null);
      },
      error: (err) => {
        console.error('Failed to update course description', err);
        this.descriptionError.set(err?.error?.error ?? 'Failed to save description.');
        this.savingDescription.set(false);
      },
    });
  }
}