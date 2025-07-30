import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarSpectralClasses } from './star-spectral-classes';

describe('StarSpectralClasses', () => {
  let component: StarSpectralClasses;
  let fixture: ComponentFixture<StarSpectralClasses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarSpectralClasses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarSpectralClasses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
