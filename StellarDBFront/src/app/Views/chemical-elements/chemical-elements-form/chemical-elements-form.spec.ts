import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChemicalElementsForm } from './chemical-elements-form';

describe('ChemicalElementsForm', () => {
  let component: ChemicalElementsForm;
  let fixture: ComponentFixture<ChemicalElementsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChemicalElementsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChemicalElementsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
