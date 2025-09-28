import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Constellations } from './constellations';

describe('Constellations', () => {
  let component: Constellations;
  let fixture: ComponentFixture<Constellations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Constellations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Constellations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
