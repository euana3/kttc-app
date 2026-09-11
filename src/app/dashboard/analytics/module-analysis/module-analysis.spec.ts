import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModuleAnalysis } from './module-analysis';

describe('ModuleAnalysis', () => {
  let component: ModuleAnalysis;
  let fixture: ComponentFixture<ModuleAnalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleAnalysis],
    }).compileComponents();

    fixture = TestBed.createComponent(ModuleAnalysis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
