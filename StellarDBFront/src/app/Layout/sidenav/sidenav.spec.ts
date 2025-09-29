import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sidenav } from './sidenav';

describe('Sidenav', () => {
  let component: Sidenav;
  let fixture: ComponentFixture<Sidenav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Sidenav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sidenav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
