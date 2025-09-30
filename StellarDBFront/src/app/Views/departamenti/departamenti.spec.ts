import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Departamenti } from './departamenti';

describe('Departamenti', () => {
  let component: Departamenti;
  let fixture: ComponentFixture<Departamenti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Departamenti]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Departamenti);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
