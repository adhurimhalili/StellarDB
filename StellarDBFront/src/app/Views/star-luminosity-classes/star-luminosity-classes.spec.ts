import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarLuminosityClasses } from './star-luminosity-classes';

describe('StarLuminosityClasses', () => {
  let component: StarLuminosityClasses;
  let fixture: ComponentFixture<StarLuminosityClasses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarLuminosityClasses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarLuminosityClasses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
