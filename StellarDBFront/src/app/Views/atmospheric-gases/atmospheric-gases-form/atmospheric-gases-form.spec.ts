import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtmosphericGasesForm } from './atmospheric-gases-form';

describe('AtmosphericGasesForm', () => {
  let component: AtmosphericGasesForm;
  let fixture: ComponentFixture<AtmosphericGasesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtmosphericGasesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtmosphericGasesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
