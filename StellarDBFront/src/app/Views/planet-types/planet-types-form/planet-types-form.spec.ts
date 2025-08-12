import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanetTypesForm } from './planet-types-form';

describe('PlanetTypesForm', () => {
  let component: PlanetTypesForm;
  let fixture: ComponentFixture<PlanetTypesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanetTypesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanetTypesForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
