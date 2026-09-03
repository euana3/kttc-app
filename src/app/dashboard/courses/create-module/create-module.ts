import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModulesService, CourseModule } from '../../../services/modules';

@Component({
  selector: 'app-create-module',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-module.html',
  styleUrl: './create-module.scss'
})
export class CreateModule implements OnInit {

  protected readonly today = signal(new Date());
  protected readonly availableModules = signal<CourseModule[]>([]);
  protected readonly selectedPrerequisiteIds = signal<number[]>([]);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');

  protected form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
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
    this.modulesService.getAll().subscribe({
      next: (modules) => this.availableModules.set(modules),
      error: (err) => console.error('Failed to load modules', err),
    });
  }

  protected togglePrerequisite(moduleId: number): void {
    this.selectedPrerequisiteIds.update(ids =>
      ids.includes(moduleId) ? ids.filter(id => id !== moduleId) : [...ids, moduleId]
    );
  }

  protected isSelected(moduleId: number): boolean {
    return this.selectedPrerequisiteIds().includes(moduleId);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage.set('Module name is required.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.modulesService.create({
      ...this.form.value,
      prerequisite_module_ids: this.selectedPrerequisiteIds(),
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/dashboard/courses']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.error ?? 'Failed to create module.');
      },
    });
  }
}