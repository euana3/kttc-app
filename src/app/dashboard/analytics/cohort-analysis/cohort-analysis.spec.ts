import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CohortAnalysis } from './cohort-analysis';

describe('CohortAnalysis', () => {
  let component: CohortAnalysis;
  let fixture: ComponentFixture<CohortAnalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CohortAnalysis],
    }).compileComponents();

    fixture = TestBed.createComponent(CohortAnalysis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
