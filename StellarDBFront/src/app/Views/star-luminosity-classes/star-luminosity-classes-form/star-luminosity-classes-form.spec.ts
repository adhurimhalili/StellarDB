import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarLuminosityClassesForm } from './star-luminosity-classes-form';

describe('StarLuminosityClassesForm', () => {
  let component: StarLuminosityClassesForm;
  let fixture: ComponentFixture<StarLuminosityClassesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarLuminosityClassesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarLuminosityClassesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
