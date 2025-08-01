import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarForm } from './star-form';

describe('StarForm', () => {
  let component: StarForm;
  let fixture: ComponentFixture<StarForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
