import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CoursesService, Course } from '../../../services/courses';
import { ModulesService, CourseModule } from '../../../services/modules';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-course.html',
  styleUrl: './create-course.scss'
})
export class CreateCourse implements OnInit {

  protected readonly today = signal(new Date());
  protected readonly availableCourses = signal<Course[]>([]);
  protected readonly availableModules = signal<CourseModule[]>([]);
  protected readonly selectedPrerequisiteCourseIds = signal<number[]>([]);
  protected readonly selectedModuleIds = signal<number[]>([]);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');

  protected form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private coursesService: CoursesService,
    private modulesService: ModulesService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      skills_learnt: [''],
      estimated_time: [''],
    });
  }

  ngOnInit(): void {
    this.coursesService.getAll().subscribe({
      next: (res: any) => this.availableCourses.set(res.courses ?? res),
      error: (err) => console.error('Failed to load courses', err),
    });

    this.modulesService.getAll().subscribe({
      next: (modules) => this.availableModules.set(modules),
      error: (err) => console.error('Failed to load modules', err),
    });
  }

  protected togglePrerequisiteCourse(courseId: number): void {
    this.selectedPrerequisiteCourseIds.update(ids =>
      ids.includes(courseId) ? ids.filter(id => id !== courseId) : [...ids, courseId]
    );
  }

  protected isCourseSelected(courseId: number): boolean {
    return this.selectedPrerequisiteCourseIds().includes(courseId);
  }

  protected toggleModule(moduleId: number): void {
    this.selectedModuleIds.update(ids =>
      ids.includes(moduleId) ? ids.filter(id => id !== moduleId) : [...ids, moduleId]
    );
  }

  protected isModuleSelected(moduleId: number): boolean {
    return this.selectedModuleIds().includes(moduleId);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage.set('Course name is required.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.coursesService.create({
      ...this.form.value,
      module_ids: this.selectedModuleIds(),
      prerequisite_course_ids: this.selectedPrerequisiteCourseIds(),
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/dashboard/courses']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.error ?? 'Failed to create course.');
      },
    });
  }
}