import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planet } from './planet';

describe('Planet', () => {
  let component: Planet;
  let fixture: ComponentFixture<Planet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Planet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
