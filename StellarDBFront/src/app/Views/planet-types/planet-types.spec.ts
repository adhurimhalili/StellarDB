import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanetTypes } from './planet-types';

describe('PlanetTypes', () => {
  let component: PlanetTypes;
  let fixture: ComponentFixture<PlanetTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanetTypes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanetTypes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
