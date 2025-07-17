import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StellarObjectTypesForm } from './stellar-object-types-form';

describe('StellarObjectTypesForm', () => {
  let component: StellarObjectTypesForm;
  let fixture: ComponentFixture<StellarObjectTypesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StellarObjectTypesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StellarObjectTypesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
