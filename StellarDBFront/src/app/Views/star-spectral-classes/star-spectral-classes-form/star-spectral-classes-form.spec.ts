import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarSpectralClassesForm } from './star-spectral-classes-form';

describe('StarSpectralClassesForm', () => {
  let component: StarSpectralClassesForm;
  let fixture: ComponentFixture<StarSpectralClassesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarSpectralClassesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarSpectralClassesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
