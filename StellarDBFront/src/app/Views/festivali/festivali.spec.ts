import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Festivali } from './festivali';

describe('Festivali', () => {
  let component: Festivali;
  let fixture: ComponentFixture<Festivali>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Festivali]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Festivali);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
