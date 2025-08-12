import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanetForm } from './planet-form';

describe('PlanetForm', () => {
  let component: PlanetForm;
  let fixture: ComponentFixture<PlanetForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanetForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanetForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
