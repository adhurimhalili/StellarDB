import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Eventi } from './eventi';

describe('Eventi', () => {
  let component: Eventi;
  let fixture: ComponentFixture<Eventi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Eventi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Eventi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
