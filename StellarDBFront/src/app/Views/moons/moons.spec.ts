import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Moons } from './moons';

describe('Moons', () => {
  let component: Moons;
  let fixture: ComponentFixture<Moons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Moons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Moons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
