import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstellationsForm } from './constellations-form';

describe('ConstellationsForm', () => {
  let component: ConstellationsForm;
  let fixture: ComponentFixture<ConstellationsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstellationsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstellationsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
