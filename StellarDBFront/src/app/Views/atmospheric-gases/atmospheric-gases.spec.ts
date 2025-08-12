import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtmosphericGases } from './atmospheric-gases';

describe('AtmosphericGases', () => {
  let component: AtmosphericGases;
  let fixture: ComponentFixture<AtmosphericGases>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtmosphericGases]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtmosphericGases);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
