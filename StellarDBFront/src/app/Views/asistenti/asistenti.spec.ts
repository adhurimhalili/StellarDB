import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Asistenti } from './asistenti';

describe('Asistenti', () => {
  let component: Asistenti;
  let fixture: ComponentFixture<Asistenti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Asistenti]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Asistenti);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
