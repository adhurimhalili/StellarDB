import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistentiForm } from './asistenti-form';

describe('AsistentiForm', () => {
  let component: AsistentiForm;
  let fixture: ComponentFixture<AsistentiForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistentiForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistentiForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
