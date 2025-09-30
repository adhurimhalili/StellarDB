import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartamentiForm } from './departamenti-form';

describe('DepartamentiForm', () => {
  let component: DepartamentiForm;
  let fixture: ComponentFixture<DepartamentiForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartamentiForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartamentiForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
